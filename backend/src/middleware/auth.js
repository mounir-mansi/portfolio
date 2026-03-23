const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

async function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  try {
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });
    if (blacklisted) return res.status(401).json({ error: "Token révoqué" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

module.exports = { verifyToken };
