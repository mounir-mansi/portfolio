const prisma = require("../lib/prisma");
const { sendContactNotification, sendReply } = require("../lib/emailSender");

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
    await prisma.contactMessage.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        activity: activity || null,
        message: message || null,
        source,
      },
    });

    // Email best-effort (pas bloquant)
    sendContactNotification({ name, email, phone, activity, message, source }).catch((err) =>
      console.error("Email notification error:", err)
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("contact error:", err);
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

module.exports = { submitContact, getMessages, markRead, deleteMessage, replyMessage };
