require("dotenv").config();

// Aucun vrai email ne part pendant les tests
jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendBriefNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { sendContactNotification, sendBriefNotification } = require("../src/lib/emailSender");

let cookie;
const AUTO = "TEST-AUTO";

beforeAll(async () => {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  cookie = res.headers["set-cookie"];
});

afterAll(async () => {
  await prisma.contactMessage.deleteMany({
    where: { OR: [{ email: "test@test.com" }, { name: { startsWith: AUTO } }] },
  });
  await prisma.$disconnect();
});

describe("Contact", () => {
  test("POST /contact — message valide retourne 200", async () => {
    const res = await request(app).post("/contact").send({
      name: "Test",
      email: "test@test.com",
      message: "Message de test",
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("POST /contact — champs manquants retourne 400", async () => {
    const res = await request(app).post("/contact").send({ name: "Test" });
    expect(res.status).toBe(400);
  });

  test("POST /contact — email invalide retourne 400", async () => {
    const res = await request(app).post("/contact").send({
      name: "Test",
      email: "pasunemail",
      message: "Message",
    });
    expect(res.status).toBe(400);
  });

  test("POST /contact — sans email ni source devis retourne 400", async () => {
    const res = await request(app).post("/contact").send({
      name: "Test",
      phone: "0612345678",
      message: "Message",
    });
    expect(res.status).toBe(400);
  });

  test("GET /admin/messages — sans token retourne 401", async () => {
    const res = await request(app).get("/admin/messages");
    expect(res.status).toBe(401);
  });

  test("GET /admin/messages — avec token retourne liste", async () => {
    const res = await request(app)
      .get("/admin/messages")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Demande de maquette (source devis)", () => {
  const devis = (extra = {}) => ({
    source: "devis",
    name: `${AUTO} Boulangerie`,
    phone: "06 12 34 56 78",
    activity: "Boulangerie",
    ...extra,
  });

  test("valide sans email : 200, enregistrée avec source devis", async () => {
    const res = await request(app).post("/contact").send(devis());
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const row = await prisma.contactMessage.findFirst({
      where: { name: `${AUTO} Boulangerie` },
      orderBy: { id: "desc" },
    });
    expect(row.source).toBe("devis");
    expect(row.phone).toBe("06 12 34 56 78");
    expect(row.activity).toBe("Boulangerie");
    expect(row.email).toBeNull();
    expect(row.message).toBeNull();
  });

  test("la notification est envoyée avec téléphone et activité", async () => {
    sendContactNotification.mockClear();
    await request(app).post("/contact").send(devis({ name: `${AUTO} Notif` }));
    expect(sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({ source: "devis", phone: "06 12 34 56 78", activity: "Boulangerie" })
    );
  });

  test("avec un email facultatif valide : 200", async () => {
    const res = await request(app).post("/contact").send(devis({ name: `${AUTO} Email`, email: "ok@example.com" }));
    expect(res.status).toBe(200);
  });

  test("téléphone manquant : 400", async () => {
    const res = await request(app).post("/contact").send(devis({ phone: "" }));
    expect(res.status).toBe(400);
  });

  test("activité manquante : 400", async () => {
    const res = await request(app).post("/contact").send(devis({ activity: "" }));
    expect(res.status).toBe(400);
  });

  test("téléphone invalide : 400", async () => {
    const res = await request(app).post("/contact").send(devis({ phone: "abc" }));
    expect(res.status).toBe(400);
  });

  test("email facultatif invalide : 400", async () => {
    const res = await request(app).post("/contact").send(devis({ email: "pasunemail" }));
    expect(res.status).toBe(400);
  });

  test("activité trop longue : 400", async () => {
    const res = await request(app).post("/contact").send(devis({ activity: "x".repeat(101) }));
    expect(res.status).toBe(400);
  });

  test("types inattendus (nombre, objet) : 400 sans planter", async () => {
    const res = await request(app).post("/contact").send({ source: "devis", name: 42, phone: {}, activity: [] });
    expect(res.status).toBe(400);
  });

  test("répondre à un contact sans email : 400 explicite", async () => {
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Boulangerie` }, orderBy: { id: "desc" } });
    const res = await request(app)
      .post(`/admin/messages/${row.id}/reply`)
      .set("Cookie", cookie)
      .send({ replyMessage: "Bonjour" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });
});

describe("Brief de la demande de maquette (formulaire en étapes)", () => {
  const demande = async (suffix) => {
    const res = await request(app).post("/contact").send({
      source: "devis",
      name: `${AUTO} Brief ${suffix}`,
      phone: "0612345678",
      activity: "Boulangerie",
    });
    return res.body.token;
  };
  const patch = (body) => request(app).patch("/contact/brief").send(body);

  test("l'étape 1 renvoie un jeton, pas la page Contact", async () => {
    const token = await demande("jeton");
    expect(token).toMatch(/^[a-f0-9]{48}$/);
    const contact = await request(app).post("/contact").send({ name: "Test", email: "test@test.com", message: "Bonjour" });
    expect(contact.body.token).toBeUndefined();
  });

  test("le jeton n'est pas stocké en clair", async () => {
    const token = await demande("hash");
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Brief hash` } });
    expect(row.briefTokenHash).toBeTruthy();
    expect(row.briefTokenHash).not.toBe(token);
    expect(row.briefExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test("complète la demande par étapes", async () => {
    const token = await demande("etapes");
    expect((await patch({ token, pages: ["accueil", "menu", "commande"], pagesAutre: "Galerie photos" })).status).toBe(200);
    expect((await patch({ token, theme: "sombre", couleurs: "bleu nuit et or", aLogo: true })).status).toBe(200);
    expect((await patch({ token, echeance: "1mois", creneau: "matin" })).status).toBe(200);
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Brief etapes` } });
    expect(row.pages).toEqual(["accueil", "menu", "commande"]);
    expect(row.theme).toBe("sombre");
    expect(row.aLogo).toBe(true);
    expect(row.echeance).toBe("1mois");
    expect(row.briefDone).toBe(false);
  });

  test("final: true envoie un seul email récapitulatif", async () => {
    const token = await demande("final");
    sendBriefNotification.mockClear();
    await patch({ token, theme: "clair", final: true });
    await patch({ token, final: true });
    expect(sendBriefNotification).toHaveBeenCalledTimes(1);
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Brief final` } });
    expect(row.briefDone).toBe(true);
  });

  test("jeton absent, mal formé ou inconnu : 401", async () => {
    expect((await patch({ theme: "clair" })).status).toBe(401);
    expect((await patch({ token: "abc", theme: "clair" })).status).toBe(401);
    expect((await patch({ token: "a".repeat(48), theme: "clair" })).status).toBe(401);
  });

  test("jeton expiré : 401", async () => {
    const token = await demande("expire");
    await prisma.contactMessage.updateMany({ where: { name: `${AUTO} Brief expire` }, data: { briefExpiresAt: new Date(Date.now() - 1000) } });
    expect((await patch({ token, theme: "clair" })).status).toBe(401);
  });

  test("valeurs interdites : 400", async () => {
    const token = await demande("invalide");
    expect((await patch({ token, theme: "rose" })).status).toBe(400);
    expect((await patch({ token, pages: ["accueil", "inconnu"] })).status).toBe(400);
    expect((await patch({ token, pages: "accueil" })).status).toBe(400);
    expect((await patch({ token, echeance: "hier" })).status).toBe(400);
    expect((await patch({ token, creneau: "nuit" })).status).toBe(400);
    expect((await patch({ token, aLogo: "oui" })).status).toBe(400);
    expect((await patch({ token, couleurs: "x".repeat(201) })).status).toBe(400);
    expect((await patch({ token, pagesAutre: "x".repeat(301) })).status).toBe(400);
  });

  test("un jeton ne modifie que sa propre demande", async () => {
    const t1 = await demande("a");
    await demande("b");
    await patch({ token: t1, theme: "sombre" });
    const b = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Brief b` } });
    expect(b.theme).toBeNull();
  });

  test("les champs de l'étape 1 ne sont pas modifiables par le brief", async () => {
    const token = await demande("immuable");
    await patch({ token, name: "Pirate", phone: "0000000000", email: "x@y.fr", theme: "clair" });
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} Brief immuable` } });
    expect(row).toBeTruthy();
    expect(row.phone).toBe("0612345678");
  });
});
