const path = require("path");
const { Resend } = require("resend");
const storage = require("./briefStorage");

const resend = new Resend(process.env.RESEND_API_KEY);

// Taille maximale des pièces jointes par email (les fichiers d'un même brief sont répartis sur plusieurs mails au-delà)
const MAX_MAIL_BYTES = 15 * 1024 * 1024;

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sendContactNotification({ name, email, phone, activity, company, message, source }) {
  const isQuote = source === "devis";
  const safeName = escapeHtml(name);
  const lines = [`<p><strong>Nom :</strong> ${safeName}</p>`];

  if (phone) {
    const safePhone = escapeHtml(phone);
    const telHref = phone.replace(/[^\d+]/g, "");
    lines.push(`<p><strong>Téléphone :</strong> <a href="tel:${telHref}">${safePhone}</a></p>`);
  }
  if (company) lines.push(`<p><strong>Commerce / entreprise :</strong> ${escapeHtml(company)}</p>`);
  if (activity) lines.push(`<p><strong>Activité :</strong> ${escapeHtml(activity)}</p>`);
  if (email) lines.push(`<p><strong>Email :</strong> ${escapeHtml(email)}</p>`);
  if (message) {
    lines.push(`<p><strong>Message :</strong></p>`);
    lines.push(`<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`);
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_CONTACT,
    subject: isQuote
      ? `Demande de maquette gratuite de ${safeName}`
      : `Nouveau message de ${safeName} — Portfolio`,
    html: `
      <h2>${isQuote ? "Nouvelle demande de maquette gratuite" : "Nouveau message depuis le portfolio"}</h2>
      ${lines.join("\n      ")}
    `,
  });
}

const PAGE_LABELS = {
  accueil: "Accueil", services: "Services", realisations: "Réalisations", apropos: "À propos", tarifs: "Tarifs",
  avis: "Avis", contact: "Contact", menu: "Menu ou carte", commande: "Commande en ligne", autre: "Autre",
};
const PACK_LABELS = {
  vitrine: "Vitrine (1 page, plusieurs sections)",
  "vitrine-plus": "Vitrine + (jusqu'à 5 pages)",
  indecis: "Ne sait pas encore, souhaite un conseil",
};
const THEME_LABELS = { clair: "Site clair", sombre: "Site sombre", indifferent: "Sans préférence" };
const ECHEANCE_LABELS = { asap: "Dès que possible", "1mois": "D'ici un mois", "2-3mois": "Dans 2 à 3 mois", "pas-presse": "Pas pressé" };
const CRENEAU_LABELS = { matin: "Le matin", "apres-midi": "L'après-midi", soir: "Le soir", "peu-importe": "Peu importe" };

// Lit les fichiers importés (menu, logo) dans le stockage privé. Noms neutres : on ne reprend jamais le nom envoyé par le visiteur.
// Un fichier illisible est ignoré (il reste téléchargeable dans l'admin), l'envoi du mail ne doit pas échouer à cause de lui.
async function loadBriefAttachments(row) {
  const entries = [
    ...(row.menuFiles || []).map((fileId, i) => ({ fileId, base: `menu-${i + 1}` })),
    ...(row.logoFile ? [{ fileId: row.logoFile, base: "logo" }] : []),
  ];
  const attachments = [];
  for (const { fileId, base } of entries) {
    try {
      const content = await storage.get(`brief/${row.id}/${fileId}`);
      attachments.push({ filename: `${base}${path.extname(fileId)}`, content });
    } catch (err) {
      console.error("Pièce jointe ignorée :", fileId, err.message);
    }
  }
  return attachments;
}

// Répartit les fichiers en lots d'au plus MAX_MAIL_BYTES (un fichier seul fait au plus 10 Mo, il tient toujours dans un lot)
function splitIntoBatches(attachments) {
  const batches = [];
  let current = [];
  let size = 0;
  for (const file of attachments) {
    if (current.length && size + file.content.length > MAX_MAIL_BYTES) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(file);
    size += file.content.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

// Email envoyé quand le visiteur termine le brief de la demande de maquette
async function sendBriefNotification(row) {
  const safeName = escapeHtml(row.name);
  const lines = [`<p><strong>Nom :</strong> ${safeName}</p>`];
  if (row.phone) lines.push(`<p><strong>Téléphone :</strong> ${escapeHtml(row.phone)}</p>`);
  if (row.company) lines.push(`<p><strong>Commerce / entreprise :</strong> ${escapeHtml(row.company)}</p>`);
  if (row.activity) lines.push(`<p><strong>Activité :</strong> ${escapeHtml(row.activity)}</p>`);

  if (row.pack) lines.push(`<p><strong>Type de site :</strong> ${PACK_LABELS[row.pack]}</p>`);
  if (row.menuFiles && row.menuFiles.length) lines.push(`<p><strong>Menu importé :</strong> ${row.menuFiles.length} fichier(s), à télécharger dans l'espace admin</p>`);
  if (row.logoFile) lines.push(`<p><strong>Logo importé :</strong> oui, à télécharger dans l'espace admin</p>`);
  const pages = (row.pages || []).map((p) => PAGE_LABELS[p] || p);
  if (pages.length) lines.push(`<p><strong>${row.pack === "vitrine" ? "Sections souhaitées" : "Pages souhaitées"} :</strong> ${escapeHtml(pages.join(", "))}</p>`);
  if (row.pagesAutre) lines.push(`<p><strong>Autre page :</strong> ${escapeHtml(row.pagesAutre)}</p>`);
  if (row.police) lines.push(`<p><strong>Police de la charte :</strong> ${escapeHtml(row.police)}</p>`);
  if (row.theme) lines.push(`<p><strong>Style :</strong> ${THEME_LABELS[row.theme]}</p>`);
  if (row.couleurs) lines.push(`<p><strong>Couleurs :</strong> ${escapeHtml(row.couleurs)}</p>`);
  if (row.aLogo !== null && row.aLogo !== undefined) lines.push(`<p><strong>Logo existant :</strong> ${row.aLogo ? "oui" : "non"}</p>`);
  if (row.echeance) lines.push(`<p><strong>Pour quand :</strong> ${ECHEANCE_LABELS[row.echeance]}</p>`);
  if (row.creneau) lines.push(`<p><strong>Créneau de rappel :</strong> ${CRENEAU_LABELS[row.creneau]}</p>`);

  const batches = splitIntoBatches(await loadBriefAttachments(row));
  const total = Math.max(batches.length, 1);
  const title = (n) => (total > 1 ? ` (fichiers ${n}/${total})` : "");

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_CONTACT,
    subject: `Brief complété : ${safeName}${title(1)}`,
    html: `<h2>Brief de maquette complété</h2>\n${lines.join("\n")}`,
    ...(batches[0] ? { attachments: batches[0] } : {}),
  });

  // Fichiers restants : un mail par lot. Une erreur ici ne doit pas faire échouer le mail principal, déjà parti.
  for (let i = 1; i < batches.length; i++) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_CONTACT,
        subject: `Brief complété : ${safeName}${title(i + 1)}`,
        html: `<p>Suite des fichiers du brief de <strong>${safeName}</strong>.</p>`,
        attachments: batches[i],
      });
    } catch (err) {
      console.error(`Brief email, lot ${i + 1}/${total} :`, err);
    }
  }
}

async function sendReply({ to, name, replyMessage }) {
  const safeName = escapeHtml(name);
  const safeReply = escapeHtml(replyMessage).replace(/\n/g, "<br>");

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Réponse à votre message — Portfolio`,
    html: `
      <p>Bonjour ${safeName},</p>
      <p>${safeReply}</p>
      <br>
      <p>ManDev Web</p>
    `,
  });
}

module.exports = { splitIntoBatches, sendContactNotification, sendBriefNotification, sendReply };
