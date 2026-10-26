const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { sendContactNotification, sendBriefNotification, sendReply } = require("../lib/emailSender");

const BRIEF_TTL_MS = 2 * 60 * 60 * 1000;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

// Valeurs autorisées pour le brief (le reste est refusé)
const BRIEF_OPTIONS = {
  pages: ["accueil", "services", "realisations", "apropos", "tarifs", "avis", "contact", "menu", "commande", "autre"],
  theme: ["clair", "sombre", "indifferent"],
  echeance: ["asap", "1mois", "2-3mois", "pas-presse"],
  creneau: ["matin", "apres-midi", "soir", "peu-importe"],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;
const PHONE_REGEX = /^\+?\d{8,15}$/;
const MAX = { name: 100, email: 254, phone: 30, activity: 100, message: 2000 };

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
        message: message || null,
        source,
        briefTokenHash: token ? sha256(token) : null,
        briefExpiresAt: token ? new Date(Date.now() + BRIEF_TTL_MS) : null,
      },
    });

    // Email best-effort (pas bloquant)
    sendContactNotification({ name, email, phone, activity, message, source }).catch((err) =>
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

module.exports = { submitContact, updateBrief, getMessages, markRead, deleteMessage, replyMessage };
