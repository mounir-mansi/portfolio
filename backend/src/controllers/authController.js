const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 8 * 60 * 60 * 1000, // 8h
};

// Pour effacer le cookie, le navigateur exige les mêmes attributs qu'à sa création (sans la durée)
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite,
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

// Un jeton dure 8 h : une ligne de la liste noire plus vieille que ça ne sert plus à rien
const DUREE_JETON_MS = 8 * 60 * 60 * 1000;

function jetonValide(token) {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function logout(req, res) {
  const token = req.cookies?.token;
  // Seuls les jetons que nous avons signés entrent dans la liste noire : un cookie inventé ne laisse aucune trace
  if (token && jetonValide(token)) {
    try {
      await prisma.blacklistedToken.create({ data: { token } });
    } catch (err) {
      // P2002 = déjà révoqué : normal. Jamais le jeton dans les logs, seulement le code d'erreur.
      if (err.code !== "P2002") console.error("logout: écriture liste noire:", err.code || err.name);
    }
    try {
      await prisma.blacklistedToken.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - DUREE_JETON_MS) } },
      });
    } catch (err) {
      console.error("logout: purge liste noire:", err.code || err.name);
    }
  }
  res.clearCookie("token", CLEAR_COOKIE_OPTIONS);
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ id: req.admin.id, username: req.admin.username });
}

module.exports = { login, logout, me };
