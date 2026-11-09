const prisma = require("../lib/prisma");
const { sendReviewNotification } = require("../lib/emailSender");
const { clean, HONEYPOT_FIELD, hasLink } = require("../lib/antispam");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 60, role: 100, email: 254, text: 1000 };
const MIN_TEXT = 20;
const STATUSES = ["pending", "published", "hidden"];

// Avis publiés, visibles par tout le monde. Jamais d'email ni de statut : seulement ce qui s'affiche.
async function getReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { id: true, name: true, role: true, rating: true, text: true, publishedAt: true },
    });
    res.json(reviews);
  } catch (err) {
    console.error("reviews list error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Dépôt d'un avis : il arrive « pending » et n'est publié qu'après relecture dans l'admin.
async function submitReview(req, res) {
  const body = req.body || {};

  // Champ piège rempli : c'est un robot. On répond comme si tout allait bien, sans rien enregistrer ni envoyer.
  if (clean(body[HONEYPOT_FIELD])) return res.json({ ok: true });

  const name = clean(body.name);
  const role = clean(body.role);
  const email = clean(body.email);
  const text = clean(body.text);
  const { rating } = body;

  if (!name) return res.status(400).json({ error: "Votre prénom est requis." });
  if (name.length > MAX.name) return res.status(400).json({ error: "Prénom trop long." });
  if (role.length > MAX.role) return res.status(400).json({ error: "Métier ou entreprise trop long." });
  // typeof : « true » ou « "5" » ne passent pas pour une note
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(400).json({ error: "Choisissez une note de 1 à 5." });
  if (text.length < MIN_TEXT)
    return res.status(400).json({ error: `Votre avis est trop court (${MIN_TEXT} caractères minimum).` });
  if (text.length > MAX.text) return res.status(400).json({ error: "Avis trop long." });
  if (email && (email.length > MAX.email || !EMAIL_REGEX.test(email)))
    return res.status(400).json({ error: "Email invalide." });
  if (body.consent !== true)
    return res.status(400).json({ error: "Vous devez accepter la publication de votre prénom et de votre avis." });
  if (hasLink(name, role, text))
    return res.status(400).json({ error: "Les liens ne sont pas acceptés dans ce formulaire.", code: "LINKS" });

  try {
    await prisma.review.create({
      data: { name, role: role || null, rating, text, email: email || null },
    });

    // Email best-effort (pas bloquant) : l'échec est journalisé, jamais avalé
    sendReviewNotification({ name, role, rating, text, email }).catch((err) =>
      console.error("Review email notification error:", err)
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("review error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// --- Admin ---

async function getAllReviews(req, res) {
  try {
    res.json(await prisma.review.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (err) {
    console.error("admin reviews list error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

const parseId = (value) => (/^\d+$/.test(value) ? Number(value) : null);

async function setReviewStatus(req, res) {
  const id = parseId(req.params.id);
  const status = req.body?.status;
  if (id === null) return res.status(400).json({ error: "Identifiant invalide." });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "Statut invalide." });

  try {
    const current = await prisma.review.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Avis introuvable." });
    // La date de publication est celle de la première publication : republier ne change pas l'ordre d'affichage
    const publishedAt = status === "published" ? current.publishedAt || new Date() : current.publishedAt;
    const review = await prisma.review.update({ where: { id }, data: { status, publishedAt } });
    res.json(review);
  } catch (err) {
    console.error("review status error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteReview(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Identifiant invalide." });
  try {
    await prisma.review.deleteMany({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error("review delete error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getReviews, submitReview, getAllReviews, setReviewStatus, deleteReview };
