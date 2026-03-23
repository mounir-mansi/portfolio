const prisma = require("../lib/prisma");
const { sendContactNotification, sendReply } = require("../lib/emailSender");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submitContact(req, res) {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim())
    return res.status(400).json({ error: "Tous les champs sont requis." });
  if (name.length > 100)
    return res.status(400).json({ error: "Nom trop long." });
  if (!EMAIL_REGEX.test(email))
    return res.status(400).json({ error: "Email invalide." });
  if (message.length > 2000)
    return res.status(400).json({ error: "Message trop long." });

  try {
    await prisma.contactMessage.create({
      data: { name: name.trim(), email: email.trim(), message: message.trim() },
    });

    // Email best-effort (pas bloquant)
    sendContactNotification({ name, email, message }).catch((err) =>
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
