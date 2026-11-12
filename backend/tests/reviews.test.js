require("dotenv").config();

jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendBriefNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
  sendReviewNotification: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { sendReviewNotification } = require("../src/lib/emailSender");

const AUTO = "TEST-AVIS";
const TEXTE = "Très bon travail, site livré dans les délais et à mon image. Je recommande.";

let cookie;

beforeAll(async () => {
  const res = await request(app).post("/login").send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  cookie = res.headers["set-cookie"];
});

beforeEach(() => sendReviewNotification.mockClear());

afterAll(async () => {
  await prisma.review.deleteMany({ where: { name: { startsWith: AUTO } } });
  await prisma.$disconnect();
});

const avis = (extra = {}) =>
  request(app).post("/api/reviews").send({ name: `${AUTO} base`, lastName: "Dupont", rating: 5, text: TEXTE, consent: true, ...extra });
const lignes = (name) => prisma.review.findMany({ where: { name } });

describe("Dépôt d'un avis", () => {
  test("avis valide : enregistré « pending », notification envoyée", async () => {
    const res = await avis({ name: `${AUTO} ok`, lastName: "Martin", role: "Restaurateur", email: "client@test.fr" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const [row] = await lignes(`${AUTO} ok`);
    expect(row).toMatchObject({ lastName: "Martin", status: "pending", rating: 5, role: "Restaurateur", email: "client@test.fr", publishedAt: null });
    expect(sendReviewNotification).toHaveBeenCalledTimes(1);
    expect(sendReviewNotification.mock.calls[0][0]).toMatchObject({ name: `${AUTO} ok`, lastName: "Martin", rating: 5 });
  });

  test("champs facultatifs vides : stockés à null", async () => {
    await avis({ name: `${AUTO} minimal`, role: "", email: "" });
    const [row] = await lignes(`${AUTO} minimal`);
    expect(row.role).toBeNull();
    expect(row.email).toBeNull();
  });

  test("un avis en attente n'apparaît pas dans la liste publique", async () => {
    await avis({ name: `${AUTO} attente` });
    const res = await request(app).get("/api/reviews");
    expect(res.status).toBe(200);
    expect(res.body.some((r) => r.name === `${AUTO} attente`)).toBe(false);
  });

  test("champ piège rempli : réponse « ok » mais rien n'est enregistré ni envoyé", async () => {
    const res = await avis({ name: `${AUTO} piege`, website_url_check: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(await lignes(`${AUTO} piege`)).toHaveLength(0);
    expect(sendReviewNotification).not.toHaveBeenCalled();
  });

  test("l'échec de l'email ne bloque pas le visiteur et il est journalisé", async () => {
    const erreur = jest.spyOn(console, "error").mockImplementation(() => {});
    sendReviewNotification.mockRejectedValueOnce(new Error("Resend HS"));
    const res = await avis({ name: `${AUTO} mailKO` });
    await new Promise((r) => setImmediate(r));
    expect(res.status).toBe(200);
    expect(await lignes(`${AUTO} mailKO`)).toHaveLength(1);
    expect(erreur).toHaveBeenCalledWith("Review email notification error:", expect.any(Error));
    erreur.mockRestore();
  });
});

describe("Validation", () => {
  test.each([
    ["prénom manquant", { name: "" }],
    ["prénom trop long", { name: "x".repeat(61) }],
    ["nom manquant", { lastName: "" }],
    ["nom absent", { lastName: undefined }],
    ["nom trop long", { lastName: "x".repeat(61) }],
    ["nom en nombre", { lastName: 42 }],
    ["métier trop long", { role: "x".repeat(101) }],
    ["note à 0", { rating: 0 }],
    ["note à 6", { rating: 6 }],
    ["note décimale", { rating: 4.5 }],
    ["note en texte", { rating: "5" }],
    ["note booléenne", { rating: true }],
    ["note absente", { rating: undefined }],
    ["avis trop court", { text: "Bien." }],
    ["avis trop long", { text: "x".repeat(1001) }],
    ["email invalide", { email: "pas-un-email" }],
    ["consentement absent", { consent: undefined }],
    ["consentement refusé", { consent: false }],
    ["consentement en texte", { consent: "true" }],
  ])("refusé (400) : %s", async (_cas, extra) => {
    const res = await avis({ name: `${AUTO} invalide`, ...extra });
    expect(res.status).toBe(400);
    expect(await lignes(`${AUTO} invalide`)).toHaveLength(0);
    expect(sendReviewNotification).not.toHaveBeenCalled();
  });

  test.each([
    ["dans l'avis", { text: "Super travail, voir https://spam.example/promo pour la suite" }],
    ["dans le métier", { role: "www.spam.example" }],
    ["dans le prénom", { name: `${AUTO} http://spam.example` }],
    ["dans le nom", { lastName: "www.spam.example" }],
  ])("lien refusé %s", async (_cas, extra) => {
    const res = await avis(extra);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LINKS");
  });

  test("un avis normal qui cite « React.js » passe", async () => {
    const res = await avis({ name: `${AUTO} reactjs`, text: "Un développeur sérieux, compétent en React.js et Node.js, merci." });
    expect(res.status).toBe(200);
  });
});

describe("Administration", () => {
  test.each([
    ["GET", "/admin/reviews"],
    ["PATCH", "/admin/reviews/1/status"],
    ["DELETE", "/admin/reviews/1"],
  ])("%s %s sans connexion : 401", async (method, url) => {
    const res = await request(app)[method.toLowerCase()](url).send({ status: "published" });
    expect(res.status).toBe(401);
  });

  test("publier, republier, masquer, supprimer", async () => {
    await avis({ name: `${AUTO} cycle`, lastName: "Garnier", email: "prive@test.fr", role: "Garagiste" });
    const liste = await request(app).get("/admin/reviews").set("Cookie", cookie);
    expect(liste.status).toBe(200);
    const mien = liste.body.find((r) => r.name === `${AUTO} cycle`);
    // L'admin voit le nom complet
    expect(mien).toMatchObject({ status: "pending", email: "prive@test.fr", lastName: "Garnier" });

    // Publié : visible publiquement avec l'initiale seulement, sans email, sans nom de famille ni statut
    const pub = await request(app).patch(`/admin/reviews/${mien.id}/status`).set("Cookie", cookie).send({ status: "published" });
    expect(pub.status).toBe(200);
    expect(pub.body.publishedAt).toBeTruthy();
    const publique = await request(app).get("/api/reviews");
    const visible = publique.body.find((r) => r.id === mien.id);
    expect(visible).toEqual({ id: mien.id, name: `${AUTO} cycle G.`, role: "Garagiste", rating: 5, text: TEXTE, publishedAt: pub.body.publishedAt });
    expect(JSON.stringify(publique.body)).not.toContain("prive@test.fr");
    expect(JSON.stringify(publique.body)).not.toContain("Garnier");

    // Masqué puis republié : la date de première publication est conservée
    const masque = await request(app).patch(`/admin/reviews/${mien.id}/status`).set("Cookie", cookie).send({ status: "hidden" });
    expect(masque.status).toBe(200);
    expect((await request(app).get("/api/reviews")).body.some((r) => r.id === mien.id)).toBe(false);
    const re = await request(app).patch(`/admin/reviews/${mien.id}/status`).set("Cookie", cookie).send({ status: "published" });
    expect(re.body.publishedAt).toBe(pub.body.publishedAt);

    // Supprimé
    const sup = await request(app).delete(`/admin/reviews/${mien.id}`).set("Cookie", cookie);
    expect(sup.status).toBe(200);
    expect(await lignes(`${AUTO} cycle`)).toHaveLength(0);
  });

  test("l'initiale affichée est en majuscule, accents compris, et les espaces autour sont ignorés", async () => {
    await avis({ name: `${AUTO} initiale`, lastName: "  étienne " });
    const [row] = await lignes(`${AUTO} initiale`);
    expect(row.lastName).toBe("étienne");
    await request(app).patch(`/admin/reviews/${row.id}/status`).set("Cookie", cookie).send({ status: "published" });
    const visible = (await request(app).get("/api/reviews")).body.find((r) => r.id === row.id);
    expect(visible.name).toBe(`${AUTO} initiale É.`);
  });

  test("ancien avis sans nom de famille : seul le prénom s'affiche", async () => {
    const ancien = await prisma.review.create({
      data: { name: `${AUTO} ancien`, rating: 4, text: TEXTE, status: "published", publishedAt: new Date() },
    });
    const visible = (await request(app).get("/api/reviews")).body.find((r) => r.id === ancien.id);
    expect(visible.name).toBe(`${AUTO} ancien`);
  });

  test("statut inconnu, identifiant invalide ou absent", async () => {
    await avis({ name: `${AUTO} statut` });
    const [row] = await lignes(`${AUTO} statut`);
    const patch = (id, status) => request(app).patch(`/admin/reviews/${id}/status`).set("Cookie", cookie).send({ status });
    expect((await patch(row.id, "supprimé")).status).toBe(400);
    expect((await patch("abc", "published")).status).toBe(400);
    expect((await patch(2147483000, "published")).status).toBe(404);
    expect((await request(app).delete("/admin/reviews/abc").set("Cookie", cookie)).status).toBe(400);
  });
});
