require("dotenv").config();

jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendBriefNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { sendContactNotification } = require("../src/lib/emailSender");

const AUTO = "TEST-SPAM";

beforeEach(() => sendContactNotification.mockClear());

afterAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: AUTO } } });
  await prisma.$disconnect();
});

const contact = (extra = {}) =>
  request(app).post("/contact").send({ name: `${AUTO} contact`, email: "client@test.fr", message: "Bonjour, je voudrais un site pour mon salon.", ...extra });
const devis = (extra = {}) =>
  request(app).post("/contact").send({ source: "devis", name: `${AUTO} devis`, phone: "0612345678", activity: "Plombier", ...extra });
const lignes = (name) => prisma.contactMessage.count({ where: { name } });

describe("Champ piège (robots)", () => {
  test("champ piège rempli : réponse « ok » mais rien n'est enregistré ni envoyé", async () => {
    const res = await contact({ name: `${AUTO} piege`, website_url_check: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(await lignes(`${AUTO} piege`)).toBe(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  test("champ piège vide : la demande passe normalement", async () => {
    const res = await contact({ name: `${AUTO} normal`, website_url_check: "" });
    expect(res.status).toBe(200);
    expect(await lignes(`${AUTO} normal`)).toBe(1);
    expect(sendContactNotification).toHaveBeenCalledTimes(1);
  });

  test("demande de maquette : le champ piège s'applique aussi", async () => {
    const res = await devis({ name: `${AUTO} piege devis`, website_url_check: "x" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(await lignes(`${AUTO} piege devis`)).toBe(0);
  });
});

describe("Liens refusés", () => {
  test("le message reçu en vrai (lien vers un faux cahier des charges) est refusé", async () => {
    const res = await contact({
      name: `${AUTO} lien`,
      message: "Un chiffrage pour un site vitrine et les délais de mise en ligne ? Le cahier des charges : https://mondocs.my.id/fr/mkt/mandev",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LINKS");
    expect(await lignes(`${AUTO} lien`)).toBe(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  test.each([
    "Regardez www.exemple.com pour le détail",
    "Voir mondocs.my.id/fr/cahier",
    "http://exemple.fr",
  ])("lien refusé dans le message : %s", async (message) => {
    const res = await contact({ name: `${AUTO} lien2`, message });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LINKS");
  });

  test("lien refusé aussi dans l'activité d'une demande de maquette", async () => {
    const res = await devis({ name: `${AUTO} lien3`, activity: "Voir https://spam.example/promo" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LINKS");
  });

  test.each([
    "Je cherche un développeur React.js et Node.js pour mon site.",
    "Mon restaurant, c'est pizza.com, mais sans slash ni lien cliquable.",
    "Budget 500 € et délai de 7 jours, merci.",
  ])("un message normal passe : %s", async (message) => {
    const res = await contact({ name: `${AUTO} ok`, message });
    expect(res.status).toBe(200);
  });
});
