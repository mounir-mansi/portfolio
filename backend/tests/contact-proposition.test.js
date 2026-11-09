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
const { sendContactNotification } = require("../src/lib/emailSender");

const AUTO = "TEST-PROPOSITION";

beforeEach(() => sendContactNotification.mockClear());

afterAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: AUTO } } });
  await prisma.$disconnect();
});

const proposition = (extra = {}) =>
  request(app).post("/contact").send({
    source: "proposition",
    name: `${AUTO} ok`,
    propositions: ["forme", "maintenance"],
    ajouts: [],
    code: "k7x9p2ab",
    ...extra,
  });
const lignes = (name) => prisma.contactMessage.count({ where: { name } });

describe("Page proposition (lien d'un email de prospection)", () => {
  test("demande valide : enregistrée avec ses cases, son code et la source, email de notification envoyé", async () => {
    const res = await proposition({ name: `${AUTO} valide`, ajouts: ["reservation", "appel"], message: "Plutôt en fin de journée", phone: "06 12 34 56 78" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} valide` } });
    expect(row.source).toBe("proposition");
    expect(row.propositions).toEqual(["forme", "maintenance"]);
    expect(row.ajouts).toEqual(["reservation", "appel"]);
    expect(row.prospectCode).toBe("k7x9p2ab");
    expect(row.message).toBe("Plutôt en fin de journée");
    expect(row.email).toBeNull();

    expect(sendContactNotification).toHaveBeenCalledTimes(1);
    expect(sendContactNotification.mock.calls[0][0]).toMatchObject({
      source: "proposition",
      prospectCode: "k7x9p2ab",
      propositions: ["forme", "maintenance"],
    });
  });

  test("seul le nom est obligatoire côté identité : ni téléphone ni email requis", async () => {
    const res = await proposition({ name: `${AUTO} nom seul`, phone: undefined });
    expect(res.status).toBe(200);
    expect(await lignes(`${AUTO} nom seul`)).toBe(1);
  });

  test("sans code (lien sans personnalisation) : acceptée, code vide", async () => {
    const res = await proposition({ name: `${AUTO} sans code`, code: undefined });
    expect(res.status).toBe(200);
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} sans code` } });
    expect(row.prospectCode).toBeNull();
  });

  test("une case décochée n'est pas enregistrée ; tout décoché mais un message : acceptée", async () => {
    const res = await proposition({ name: `${AUTO} message seul`, propositions: [], ajouts: [], message: "Pouvez-vous me rappeler ?" });
    expect(res.status).toBe(200);
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} message seul` } });
    expect(row.propositions).toEqual([]);
  });

  test("rien de coché et pas de message : refusée", async () => {
    const res = await proposition({ name: `${AUTO} vide`, propositions: [], ajouts: [] });
    expect(res.status).toBe(400);
    expect(await lignes(`${AUTO} vide`)).toBe(0);
  });

  test("nom manquant : refusée", async () => {
    const res = await proposition({ name: "" });
    expect(res.status).toBe(400);
  });

  test("proposition inconnue : refusée (y compris les noms d'objets JavaScript)", async () => {
    for (const intrus of ["pirate", "constructor", "__proto__", "toString"]) {
      const res = await proposition({ name: `${AUTO} intrus`, propositions: [intrus] });
      expect(res.status).toBe(400);
    }
    expect(await lignes(`${AUTO} intrus`)).toBe(0);
  });

  test("cases qui ne sont pas une liste : refusée", async () => {
    expect((await proposition({ name: `${AUTO} format`, propositions: "forme" })).status).toBe(400);
    expect((await proposition({ name: `${AUTO} format`, ajouts: { a: 1 } })).status).toBe(400);
    expect((await proposition({ name: `${AUTO} format`, propositions: [1, 2] })).status).toBe(400);
  });

  test("doublons dans les cases : dédoublonnés", async () => {
    const res = await proposition({ name: `${AUTO} doublons`, propositions: ["forme", "forme", "maintenance"] });
    expect(res.status).toBe(200);
    const row = await prisma.contactMessage.findFirst({ where: { name: `${AUTO} doublons` } });
    expect(row.propositions).toEqual(["forme", "maintenance"]);
  });

  test("code invalide (majuscules, espaces, trop court, trop long) : refusée", async () => {
    for (const code of ["AB", "k7x9 p2", "../../etc", "a".repeat(13), "<script>"]) {
      const res = await proposition({ name: `${AUTO} code`, code });
      expect(res.status).toBe(400);
    }
    expect(await lignes(`${AUTO} code`)).toBe(0);
  });

  test("téléphone invalide : refusée", async () => {
    const res = await proposition({ name: `${AUTO} tel`, phone: "pas un numero" });
    expect(res.status).toBe(400);
  });

  test("lien dans le message : refusé (anti-spam)", async () => {
    const res = await proposition({ name: `${AUTO} lien`, message: "Voir https://mondocs.example/offre" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LINKS");
    expect(await lignes(`${AUTO} lien`)).toBe(0);
  });

  test("message trop long : refusé", async () => {
    const res = await proposition({ name: `${AUTO} long`, message: "a".repeat(2001) });
    expect(res.status).toBe(400);
  });

  test("champ piège rempli : réponse « ok » mais rien d'enregistré ni d'envoyé", async () => {
    const res = await proposition({ name: `${AUTO} piege`, website_url_check: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(await lignes(`${AUTO} piege`)).toBe(0);
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  test("l'échec de l'email de notification ne bloque pas la demande", async () => {
    sendContactNotification.mockRejectedValueOnce(new Error("Resend indisponible"));
    const res = await proposition({ name: `${AUTO} email en panne` });
    expect(res.status).toBe(200);
    expect(await lignes(`${AUTO} email en panne`)).toBe(1);
  });
});
