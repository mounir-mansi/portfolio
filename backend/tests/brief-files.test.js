require("dotenv").config();

// Aucun vrai email ni vrai stockage pendant les tests
jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendBriefNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../src/lib/briefStorage", () => ({
  put: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4 contenu")),
  remove: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const storage = require("../src/lib/briefStorage");

const AUTO = "TEST-FILES";
let cookie;

beforeAll(async () => {
  const res = await request(app).post("/login").send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  cookie = res.headers["set-cookie"];
});

afterAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: AUTO } } });
  await prisma.$disconnect();
});

const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from("x".repeat(40))]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(40, 1)]);
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40, 2)]);

const nouvelle = async (s) =>
  (await request(app).post("/contact").send({ source: "devis", name: `${AUTO} ${s}`, phone: "0612345678", activity: "Bar" })).body.token;
const envoyer = (token, kind, buf, name = "menu.pdf") =>
  request(app).post(`/contact/brief/files?kind=${kind}`).set("x-brief-token", token).attach("file", buf, name);
const ligne = (s) => prisma.contactMessage.findFirst({ where: { name: `${AUTO} ${s}` } });

beforeEach(() => {
  storage.put.mockClear();
  storage.remove.mockClear();
});

describe("Fichiers importés (menu, logo)", () => {
  test("menu PDF accepté, stocké sous un nom aléatoire (jamais le nom d'origine)", async () => {
    const token = await nouvelle("pdf");
    const res = await envoyer(token, "menu", PDF, "../../etc/passwd.pdf");
    expect(res.status).toBe(200);
    expect(res.body.fileId).toMatch(/^[a-f0-9]{32}\.pdf$/);
    const row = await ligne("pdf");
    expect(row.menuFiles).toEqual([res.body.fileId]);
    expect(storage.put).toHaveBeenCalledWith(`brief/${row.id}/${res.body.fileId}`, expect.any(Buffer), "application/pdf");
  });

  test("le type réel compte, pas le nom : un texte renommé en .pdf est refusé", async () => {
    const token = await nouvelle("faux");
    const res = await envoyer(token, "menu", Buffer.from("<script>alert(1)</script> ceci n'est pas un pdf"), "menu.pdf");
    expect(res.status).toBe(400);
    expect(storage.put).not.toHaveBeenCalled();
  });

  test("SVG et exécutables refusés", async () => {
    const token = await nouvelle("svg");
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>');
    expect((await envoyer(token, "logo", svg, "logo.svg")).status).toBe(400);
    expect((await envoyer(token, "logo", Buffer.concat([Buffer.from("MZ"), Buffer.alloc(60)]), "logo.png")).status).toBe(400);
  });

  test("fichier de plus de 10 Mo : 413", async () => {
    const token = await nouvelle("gros");
    const gros = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(10 * 1024 * 1024 + 10, 65)]);
    expect((await envoyer(token, "menu", gros)).status).toBe(413);
  });

  test("3 fichiers de menu au maximum", async () => {
    const token = await nouvelle("trois");
    for (let i = 0; i < 3; i++) expect((await envoyer(token, "menu", i === 1 ? JPG : PDF, `m${i}`)).status).toBe(200);
    expect((await envoyer(token, "menu", PDF)).status).toBe(400);
  });

  test("le logo remplace le précédent et marque aLogo", async () => {
    const token = await nouvelle("logo");
    const a = await envoyer(token, "logo", PNG, "a.png");
    const b = await envoyer(token, "logo", JPG, "b.jpg");
    const row = await ligne("logo");
    expect(row.logoFile).toBe(b.body.fileId);
    expect(row.aLogo).toBe(true);
    expect(storage.remove).toHaveBeenCalledWith(`brief/${row.id}/${a.body.fileId}`);
  });

  test("sans jeton, faux jeton ou jeton expiré : 401, rien n'est stocké", async () => {
    expect((await request(app).post("/contact/brief/files?kind=menu").attach("file", PDF, "m.pdf")).status).toBe(401);
    expect((await envoyer("b".repeat(48), "menu", PDF)).status).toBe(401);
    const token = await nouvelle("expire");
    await prisma.contactMessage.updateMany({ where: { name: `${AUTO} expire` }, data: { briefExpiresAt: new Date(Date.now() - 1000) } });
    expect((await envoyer(token, "menu", PDF)).status).toBe(401);
    expect(storage.put).not.toHaveBeenCalled();
  });

  test("kind invalide : 400", async () => {
    const token = await nouvelle("kind");
    expect((await envoyer(token, "autre", PDF)).status).toBe(400);
  });

  test("suppression par le visiteur : retiré du stockage et de la base", async () => {
    const token = await nouvelle("suppr");
    const up = await envoyer(token, "menu", PDF);
    const res = await request(app).delete(`/contact/brief/files/${up.body.fileId}`).set("x-brief-token", token);
    expect(res.status).toBe(200);
    expect((await ligne("suppr")).menuFiles).toEqual([]);
    expect(storage.remove).toHaveBeenCalled();
    expect((await request(app).delete(`/contact/brief/files/${"c".repeat(32)}.pdf`).set("x-brief-token", token)).status).toBe(404);
    expect((await request(app).delete("/contact/brief/files/..%2F..%2Fx").set("x-brief-token", token)).status).toBe(400);
  });

  test("un visiteur ne peut pas supprimer le fichier d'une autre demande", async () => {
    const t1 = await nouvelle("p1");
    const t2 = await nouvelle("p2");
    const up = await envoyer(t1, "menu", PDF);
    expect((await request(app).delete(`/contact/brief/files/${up.body.fileId}`).set("x-brief-token", t2)).status).toBe(404);
    expect((await ligne("p1")).menuFiles).toHaveLength(1);
  });

  test("téléchargement admin : connexion requise, en pièce jointe, sans interprétation", async () => {
    const token = await nouvelle("dl");
    const up = await envoyer(token, "menu", PDF);
    const row = await ligne("dl");
    const url = `/admin/messages/${row.id}/files/${up.body.fileId}`;
    expect((await request(app).get(url)).status).toBe(401);
    const res = await request(app).get(url).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toBe('attachment; filename="menu-1.pdf"');
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect((await request(app).get(`/admin/messages/${row.id}/files/${"d".repeat(32)}.pdf`).set("Cookie", cookie)).status).toBe(404);
  });

  test("supprimer le message supprime ses fichiers", async () => {
    const token = await nouvelle("msg");
    const up = await envoyer(token, "menu", PDF);
    const row = await ligne("msg");
    storage.remove.mockClear();
    expect((await request(app).delete(`/admin/messages/${row.id}`).set("Cookie", cookie)).status).toBe(200);
    expect(storage.remove).toHaveBeenCalledWith(`brief/${row.id}/${up.body.fileId}`);
  });
});

describe("Pages ajoutées à la main (Vitrine +)", () => {
  const patch = (b) => request(app).patch("/contact/brief").send(b);

  test("cases cochées + pages ajoutées : 5 au maximum", async () => {
    const token = await nouvelle("autres");
    await patch({ token, pack: "vitrine-plus" });
    expect((await patch({ token, pages: ["accueil", "services", "autre"], pagesAutre: "Blog, Galerie, Actualités" })).status).toBe(200);
    expect((await patch({ token, pages: ["accueil", "services", "autre"], pagesAutre: "Blog, Galerie, Actualités, Presse" })).status).toBe(400);
  });
});
