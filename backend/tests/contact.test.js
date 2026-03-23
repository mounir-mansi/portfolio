require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

let cookie;

beforeAll(async () => {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  cookie = res.headers["set-cookie"];
});

afterAll(async () => {
  await prisma.contactMessage.deleteMany({ where: { email: "test@test.com" } });
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
