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
      <p>Mounir Mansi</p>
    `,
  });
}

module.exports = { sendContactNotification, sendReply };
