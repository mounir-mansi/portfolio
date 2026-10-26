const crypto = require("crypto");
const multer = require("multer");
const prisma = require("../lib/prisma");
const storage = require("../lib/briefStorage");
const { detectFileType, MIME_BY_EXT, FILE_ID_REGEX } = require("../lib/fileType");
const { sendContactNotification, sendBriefNotification, sendReply } = require("../lib/emailSender");

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_MENU_FILES = 3;
const BRIEF_TTL_MS = 2 * 60 * 60 * 1000;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

// Valeurs autorisées pour le brief (le reste est refusé)
const BRIEF_OPTIONS = {
  pack: ["vitrine", "vitrine-plus", "indecis"],
  pages: ["accueil", "services", "realisations", "apropos", "tarifs", "avis", "contact", "menu", "commande", "autre"],
  theme: ["clair", "sombre", "indifferent"],
  echeance: ["asap", "1mois", "2-3mois", "pas-presse"],
  creneau: ["matin", "apres-midi", "soir", "peu-importe"],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;
const PHONE_REGEX = /^\+?\d{8,15}$/;
const MAX = { name: 100, email: 254, phone: 30, activity: 100, company: 100, message: 2000 };

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// Deux formulaires alimentent cette route :
// - "contact" (page Contact) : nom, email et message requis
// - "devis" (demande de maquette sur l'accueil) : nom, téléphone et activité requis, email facultatif
async function submitContact(req, res) {
  const body = req.body || {};
  const source = body.source === "devis" ? "devis" : "contact";
  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const activity = clean(body.activity);
  const company = clean(body.company);
  const message = clean(body.message);

  if (source === "devis") {
    if (!name || !phone || !activity)
      return res.status(400).json({ error: "Nom, téléphone et activité sont requis." });
  } else if (!name || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  if (name.length > MAX.name)
    return res.status(400).json({ error: "Nom trop long." });
  if (email && (email.length > MAX.email || !EMAIL_REGEX.test(email)))
    return res.status(400).json({ error: "Email invalide." });
  if (phone && (phone.length > MAX.phone || !PHONE_REGEX.test(phone.replace(PHONE_SEPARATORS, ""))))
    return res.status(400).json({ error: "Téléphone invalide." });
  if (activity.length > MAX.activity)
    return res.status(400).json({ error: "Activité trop longue." });
  if (company.length > MAX.company)
    return res.status(400).json({ error: "Nom du commerce trop long." });
  if (message.length > MAX.message)
    return res.status(400).json({ error: "Message trop long." });

  try {
    // Demande de maquette : on remet au visiteur un jeton à durée limitée pour compléter son brief.
    // Seule l'empreinte du jeton est stockée.
    const token = source === "devis" ? crypto.randomBytes(24).toString("hex") : null;

    await prisma.contactMessage.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        activity: activity || null,
        company: company || null,
        message: message || null,
        source,
        briefTokenHash: token ? sha256(token) : null,
        briefExpiresAt: token ? new Date(Date.now() + BRIEF_TTL_MS) : null,
      },
    });

    // Email best-effort (pas bloquant)
    sendContactNotification({ name, email, phone, activity, company, message, source }).catch((err) =>
      console.error("Email notification error:", err)
    );

    res.json(token ? { ok: true, token } : { ok: true });
  } catch (err) {
    console.error("contact error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Complète une demande de maquette avec le brief (pages, style, échéance...).
// Chaque champ est facultatif ; `final: true` marque le brief comme terminé et déclenche l'email récapitulatif.
async function updateBrief(req, res) {
  const body = req.body || {};
  const token = typeof body.token === "string" ? body.token : "";
  if (!/^[a-f0-9]{48}$/.test(token))
    return res.status(401).json({ error: "Lien expiré." });

  const row = await prisma.contactMessage.findUnique({ where: { briefTokenHash: sha256(token) } });
  if (!row || !row.briefExpiresAt || row.briefExpiresAt < new Date())
    return res.status(401).json({ error: "Lien expiré." });

  const data = {};

  if (body.pack !== undefined) {
    if (!BRIEF_OPTIONS.pack.includes(body.pack)) return res.status(400).json({ error: "Valeur invalide." });
    data.pack = body.pack;
  }

  if (body.pages !== undefined) {
    if (!Array.isArray(body.pages) || body.pages.length > BRIEF_OPTIONS.pages.length)
      return res.status(400).json({ error: "Pages invalides." });
    if (!body.pages.every((p) => BRIEF_OPTIONS.pages.includes(p)))
      return res.status(400).json({ error: "Pages invalides." });
    data.pages = [...new Set(body.pages)];

  }
  for (const key of ["theme", "echeance", "creneau"]) {
    if (body[key] === undefined) continue;
    if (!BRIEF_OPTIONS[key].includes(body[key]))
      return res.status(400).json({ error: "Valeur invalide." });
    data[key] = body[key];
  }
  for (const [key, max] of [["pagesAutre", 300], ["couleurs", 200]]) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== "string" || body[key].length > max)
      return res.status(400).json({ error: "Texte invalide ou trop long." });
    data[key] = body[key].trim() || null;
  }
  // Le pack Vitrine + comprend jusqu'à 5 pages : cases cochées + pages ajoutées à la main
  if ((data.pack || row.pack) === "vitrine-plus" && (data.pages !== undefined || data.pagesAutre !== undefined)) {
    const pages = data.pages !== undefined ? data.pages : row.pages;
    const autre = data.pagesAutre !== undefined ? data.pagesAutre : row.pagesAutre;
    const added = autre ? autre.split(",").map((x) => x.trim()).filter(Boolean).length : 0;
    const total = pages.filter((p) => p !== "autre").length + (pages.includes("autre") ? Math.max(added, 1) : 0);
    if (total > 5) return res.status(400).json({ error: "5 pages maximum." });
  }

  if (body.aLogo !== undefined) {
    if (typeof body.aLogo !== "boolean") return res.status(400).json({ error: "Valeur invalide." });
    data.aLogo = body.aLogo;
  }
  if (body.final === true) data.briefDone = true;

  try {
    const updated = await prisma.contactMessage.update({ where: { id: row.id }, data });

    if (body.final === true && !row.briefDone) {
      sendBriefNotification(updated).catch((err) => console.error("Brief email error:", err));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("brief error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ---- Fichiers importés par le visiteur (menu, logo) ----

async function requireBriefToken(req, res, next) {
  const token = req.get("x-brief-token") || "";
  if (!/^[a-f0-9]{48}$/.test(token)) return res.status(401).json({ error: "Lien expiré." });
  try {
    const row = await prisma.contactMessage.findUnique({ where: { briefTokenHash: sha256(token) } });
    if (!row || !row.briefExpiresAt || row.briefExpiresAt < new Date())
      return res.status(401).json({ error: "Lien expiré." });
    req.briefRow = row;
    next();
  } catch (err) {
    console.error("brief token error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 0 },
}).single("file");

function receiveFile(req, res, next) {
  memoryUpload(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(413).json({ error: "Fichier trop volumineux (10 Mo maximum)." });
    return res.status(400).json({ error: "Fichier invalide." });
  });
}

async function uploadBriefFile(req, res) {
  const row = req.briefRow;
  const kind = req.query.kind;
  if (!["menu", "logo"].includes(kind)) return res.status(400).json({ error: "Type de fichier invalide." });
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });

  const type = detectFileType(req.file.buffer);
  if (!type) return res.status(400).json({ error: "Format non accepté (PDF, JPEG, PNG ou WebP)." });
  if (kind === "menu" && row.menuFiles.length >= MAX_MENU_FILES)
    return res.status(400).json({ error: "3 fichiers maximum." });

  const fileId = `${crypto.randomBytes(16).toString("hex")}.${type.ext}`;
  try {
    await storage.put(`brief/${row.id}/${fileId}`, req.file.buffer, type.mime);

    if (kind === "menu") {
      await prisma.contactMessage.update({ where: { id: row.id }, data: { menuFiles: { push: fileId } } });
    } else {
      await prisma.contactMessage.update({ where: { id: row.id }, data: { logoFile: fileId, aLogo: true } });
      if (row.logoFile) await storage.remove(`brief/${row.id}/${row.logoFile}`);
    }
    res.json({ ok: true, fileId });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteBriefFile(req, res) {
  const row = req.briefRow;
  const { fileId } = req.params;
  if (!FILE_ID_REGEX.test(fileId)) return res.status(400).json({ error: "Fichier invalide." });

  try {
    if (row.menuFiles.includes(fileId)) {
      await prisma.contactMessage.update({ where: { id: row.id }, data: { menuFiles: row.menuFiles.filter((f) => f !== fileId) } });
    } else if (row.logoFile === fileId) {
      await prisma.contactMessage.update({ where: { id: row.id }, data: { logoFile: null } });
    } else {
      return res.status(404).json({ error: "Fichier introuvable." });
    }
    await storage.remove(`brief/${row.id}/${fileId}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete file error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Téléchargement par l'admin (route protégée) : toujours en pièce jointe, jamais affiché ni exécuté dans le navigateur
async function downloadBriefFile(req, res) {
  const { fileId } = req.params;
  if (!FILE_ID_REGEX.test(fileId)) return res.status(400).json({ error: "Fichier invalide." });
  try {
    const row = await prisma.contactMessage.findUnique({ where: { id: Number(req.params.id) } });
    const menuIndex = row ? row.menuFiles.indexOf(fileId) : -1;
    if (!row || (menuIndex === -1 && row.logoFile !== fileId)) return res.status(404).json({ error: "Fichier introuvable." });

    const ext = fileId.split(".")[1];
    const buffer = await storage.get(`brief/${row.id}/${fileId}`);
    const name = menuIndex === -1 ? `logo.${ext}` : `menu-${menuIndex + 1}.${ext}`;
    res.set({
      "Content-Type": MIME_BY_EXT[ext],
      "Content-Disposition": `attachment; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    res.send(buffer);
  } catch (err) {
    console.error("download error:", err);
    res.status(404).json({ error: "Fichier introuvable." });
  }
}

async function getMessages(req, res) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function markRead(req, res) {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    });
    res.json(msg);
  } catch {
    res.status(404).json({ error: "Message introuvable" });
  }
}

async function deleteMessage(req, res) {
  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id: Number(req.params.id) } });
    if (existing) {
      const ids = [...(existing.menuFiles || []), existing.logoFile].filter(Boolean);
      await Promise.all(ids.map((fileId) => storage.remove(`brief/${existing.id}/${fileId}`)));
    }
    await prisma.contactMessage.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Message introuvable" });
  }
}

async function replyMessage(req, res) {
  const { replyMessage: reply } = req.body;
  if (!reply?.trim())
    return res.status(400).json({ error: "Réponse vide" });

  try {
    const msg = await prisma.contactMessage.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!msg) return res.status(404).json({ error: "Message introuvable" });
    if (!msg.email)
      return res.status(400).json({ error: "Aucun email pour ce contact : rappelez-le par téléphone." });

    await sendReply({ to: msg.email, name: msg.name, replyMessage: reply });

    await prisma.contactMessage.update({
      where: { id: msg.id },
      data: { replied: true, read: true },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("reply error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { submitContact, updateBrief, requireBriefToken, receiveFile, uploadBriefFile, deleteBriefFile, downloadBriefFile, getMessages, markRead, deleteMessage, replyMessage };
