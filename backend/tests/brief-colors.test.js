require("dotenv").config();

jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendBriefNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

const AUTO = "TEST-COLORS";

afterAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { name: { startsWith: AUTO } } });
  await prisma.$disconnect();
});

const nouvelle = async (s) =>
  (await request(app).post("/contact").send({ source: "devis", name: `${AUTO} ${s}`, phone: "0612345678", activity: "Bar" })).body.token;
const patch = (b) => request(app).patch("/contact/brief").send(b);
const ligne = (s) => prisma.contactMessage.findFirst({ where: { name: `${AUTO} ${s}` } });

describe("Couleurs de la charte graphique", () => {
  test("codes hex acceptés et normalisés en majuscules", async () => {
    const token = await nouvelle("ok");
    expect((await patch({ token, couleurs: "#c9a24b,#1e0a10" })).status).toBe(200);
    expect((await ligne("ok")).couleurs).toBe("#C9A24B, #1E0A10");
  });

  test("six couleurs au maximum", async () => {
    const token = await nouvelle("six");
    const six = ["#111111", "#222222", "#333333", "#444444", "#555555", "#666666"].join(", ");
    expect((await patch({ token, couleurs: six })).status).toBe(200);
    expect((await patch({ token, couleurs: six + ", #777777" })).status).toBe(400);
  });

  test("formats refusés : texte libre, rgb non converti, hex court, code HTML", async () => {
    const token = await nouvelle("ko");
    for (const couleurs of ["bleu nuit et or", "rgb(1, 2, 3)", "#FFF", "#GGGGGG", '#111111"><script>alert(1)</script>', "#11111", 42, ["#111111"]]) {
      expect((await patch({ token, couleurs })).status).toBe(400);
    }
  });

  test("vide : efface la valeur", async () => {
    const token = await nouvelle("vide");
    await patch({ token, couleurs: "#111111" });
    expect((await patch({ token, couleurs: "" })).status).toBe(200);
    expect((await ligne("vide")).couleurs).toBeNull();
  });
});
