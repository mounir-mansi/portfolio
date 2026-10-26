require("dotenv").config();

// Aucun vrai email ne part pendant les tests
jest.mock("../src/lib/emailSender", () => ({
  sendContactNotification: jest.fn().mockResolvedValue(undefined),
  sendReply: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { sendContactNotification } = require("../src/lib/emailSender");

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
