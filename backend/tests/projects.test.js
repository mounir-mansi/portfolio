require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

let cookie;
let createdId;

beforeAll(async () => {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  cookie = res.headers["set-cookie"];
});

afterAll(async () => {
  if (createdId) {
    await prisma.project.deleteMany({ where: { id: createdId } });
  }
  await prisma.$disconnect();
});

describe("Projects", () => {
  test("GET /api/projects — retourne tableau", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /admin/projects — sans token retourne 401", async () => {
    const res = await request(app)
      .post("/admin/projects")
      .field("title", "Test")
      .field("description", "Desc");
    expect(res.status).toBe(401);
  });

  test("POST /admin/projects — avec token crée le projet", async () => {
    const res = await request(app)
      .post("/admin/projects")
      .set("Cookie", cookie)
      .field("title", "Projet Test")
      .field("description", "Description test")
      .field("stack", "React,Node");

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Projet Test");
    createdId = res.body.id;
  });

  test("DELETE /admin/projects/:id — avec token supprime le projet", async () => {
    const res = await request(app)
      .delete(`/admin/projects/${createdId}`)
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    createdId = null;
  });
});
