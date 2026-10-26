const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sendContactNotification({ name, email, phone, activity, message, source }) {
  const isQuote = source === "devis";
  const safeName = escapeHtml(name);
  const lines = [`<p><strong>Nom :</strong> ${safeName}</p>`];

  if (phone) {
    const safePhone = escapeHtml(phone);
    const telHref = phone.replace(/[^\d+]/g, "");
    lines.push(`<p><strong>Téléphone :</strong> <a href="tel:${telHref}">${safePhone}</a></p>`);
  }
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
const THEME_LABELS = { clair: "Site clair", sombre: "Site sombre", indifferent: "Sans préférence" };
const ECHEANCE_LABELS = { asap: "Dès que possible", "1mois": "D'ici un mois", "2-3mois": "Dans 2 à 3 mois", "pas-presse": "Pas pressé" };
const CRENEAU_LABELS = { matin: "Le matin", "apres-midi": "L'après-midi", soir: "Le soir", "peu-importe": "Peu importe" };

// Email envoyé quand le visiteur termine le brief de la demande de maquette
async function sendBriefNotification(row) {
  const safeName = escapeHtml(row.name);
  const lines = [`<p><strong>Nom :</strong> ${safeName}</p>`];
  if (row.phone) lines.push(`<p><strong>Téléphone :</strong> ${escapeHtml(row.phone)}</p>`);
  if (row.activity) lines.push(`<p><strong>Activité :</strong> ${escapeHtml(row.activity)}</p>`);

  const pages = (row.pages || []).map((p) => PAGE_LABELS[p] || p);
  if (pages.length) lines.push(`<p><strong>Pages souhaitées :</strong> ${escapeHtml(pages.join(", "))}</p>`);
  if (row.pagesAutre) lines.push(`<p><strong>Autre page :</strong> ${escapeHtml(row.pagesAutre)}</p>`);
  if (row.theme) lines.push(`<p><strong>Style :</strong> ${THEME_LABELS[row.theme]}</p>`);
  if (row.couleurs) lines.push(`<p><strong>Couleurs :</strong> ${escapeHtml(row.couleurs)}</p>`);
  if (row.aLogo !== null && row.aLogo !== undefined) lines.push(`<p><strong>Logo existant :</strong> ${row.aLogo ? "oui" : "non"}</p>`);
  if (row.echeance) lines.push(`<p><strong>Pour quand :</strong> ${ECHEANCE_LABELS[row.echeance]}</p>`);
  if (row.creneau) lines.push(`<p><strong>Créneau de rappel :</strong> ${CRENEAU_LABELS[row.creneau]}</p>`);

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_CONTACT,
    subject: `Brief complété : ${safeName}`,
    html: `<h2>Brief de maquette complété</h2>\n${lines.join("\n")}`,
  });
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

module.exports = { sendContactNotification, sendBriefNotification, sendReply };
