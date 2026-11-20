require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

const PREFIXE = "AUTO-logout-";
const HUIT_HEURES = 8 * 60 * 60 * 1000;

afterAll(async () => {
  await prisma.blacklistedToken.deleteMany({ where: { token: { startsWith: PREFIXE } } });
  await prisma.$disconnect();
});

async function seConnecter() {
  const res = await request(app)
    .post("/login")
    .send({ username: "admin", password: process.env.ADMIN_PASSWORD });
  const cookie = res.headers["set-cookie"];
  const token = cookie.find((c) => c.startsWith("token=")).split(";")[0].slice("token=".length);
  return { cookie, token };
}

describe("POST /logout", () => {
  test("sans cookie : 200 et aucune ligne ajoutée", async () => {
    const avant = await prisma.blacklistedToken.count();
    const res = await request(app).post("/logout");
    expect(res.status).toBe(200);
    expect(await prisma.blacklistedToken.count()).toBe(avant);
  });

  test("cookie quelconque : 200 et rien d'écrit dans la liste noire", async () => {
    const avant = await prisma.blacklistedToken.count();
    const bidon = `${PREFIXE}valeur-inventee`;
    const res = await request(app).post("/logout").set("Cookie", `token=${bidon}`);
    expect(res.status).toBe(200);
    expect(await prisma.blacklistedToken.findUnique({ where: { token: bidon } })).toBeNull();
    expect(await prisma.blacklistedToken.count()).toBe(avant);
  });

  test("jeton signé avec un autre secret : rien d'écrit", async () => {
    const avant = await prisma.blacklistedToken.count();
    const faux = jwt.sign({ id: 1, username: "admin" }, "un-autre-secret", { expiresIn: "8h" });
    const res = await request(app).post("/logout").set("Cookie", `token=${faux}`);
    expect(res.status).toBe(200);
    expect(await prisma.blacklistedToken.count()).toBe(avant);
  });

  test("jeton expiré : rien d'écrit", async () => {
    const avant = await prisma.blacklistedToken.count();
    const expire = jwt.sign({ id: 1, username: "admin" }, process.env.JWT_SECRET, { expiresIn: -10 });
    const res = await request(app).post("/logout").set("Cookie", `token=${expire}`);
    expect(res.status).toBe(200);
    expect(await prisma.blacklistedToken.count()).toBe(avant);
  });

  test("vrai jeton : 200, cookie effacé, jeton révoqué ensuite", async () => {
    const { cookie, token } = await seConnecter();

    const res = await request(app).post("/logout").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.headers["set-cookie"].join(";")).toMatch(/token=;/);
    expect(await prisma.blacklistedToken.findUnique({ where: { token } })).not.toBeNull();

    const apres = await request(app).get("/admin/me").set("Cookie", cookie);
    expect(apres.status).toBe(401);

    await prisma.blacklistedToken.delete({ where: { token } });
  });

  test("supprime les lignes de plus de 8 h et garde les récentes", async () => {
    const vieux = `${PREFIXE}vieux-${Date.now()}`;
    const recent = `${PREFIXE}recent-${Date.now()}`;
    await prisma.blacklistedToken.create({
      data: { token: vieux, createdAt: new Date(Date.now() - HUIT_HEURES - 60 * 60 * 1000) },
    });
    await prisma.blacklistedToken.create({ data: { token: recent } });

    const { cookie, token } = await seConnecter();
    const res = await request(app).post("/logout").set("Cookie", cookie);
    expect(res.status).toBe(200);

    expect(await prisma.blacklistedToken.findUnique({ where: { token: vieux } })).toBeNull();
    expect(await prisma.blacklistedToken.findUnique({ where: { token: recent } })).not.toBeNull();

    await prisma.blacklistedToken.deleteMany({ where: { token: { in: [token, recent] } } });
  });
});

describe("GET /logout (ancienne route)", () => {
  test("ne révoque plus le jeton", async () => {
    const { cookie, token } = await seConnecter();

    await request(app).get("/logout").set("Cookie", cookie);

    expect(await prisma.blacklistedToken.findUnique({ where: { token } })).toBeNull();
    const me = await request(app).get("/admin/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
  });
});
