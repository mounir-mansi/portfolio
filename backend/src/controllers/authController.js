const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 8 * 60 * 60 * 1000, // 8h
};

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Champs requis" });

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ error: "Identifiants invalides" });

    const valid = await argon2.verify(admin.password, password);
    if (!valid) return res.status(401).json({ error: "Identifiants invalides" });

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ ok: true });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function logout(req, res) {
  const token = req.cookies?.token;
  if (token) {
    try {
      await prisma.blacklistedToken.create({ data: { token } });
    } catch {}
  }
  res.clearCookie("token");
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ id: req.admin.id, username: req.admin.username });
}

module.exports = { login, logout, me };
