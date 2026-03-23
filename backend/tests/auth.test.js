require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth", () => {
  test("POST /login — identifiants valides retourne 200 + cookie", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "admin", password: process.env.ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("POST /login — mauvais mot de passe retourne 401", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "admin", password: "mauvais" });

    expect(res.status).toBe(401);
  });

  test("POST /login — champs manquants retourne 400", async () => {
    const res = await request(app).post("/login").send({ username: "admin" });
    expect(res.status).toBe(400);
  });

  test("GET /admin/me — sans token retourne 401", async () => {
    const res = await request(app).get("/admin/me");
    expect(res.status).toBe(401);
  });

  test("GET /admin/me — avec token valide retourne 200", async () => {
    const loginRes = await request(app)
      .post("/login")
      .send({ username: "admin", password: process.env.ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app).get("/admin/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("admin");
  });
});
