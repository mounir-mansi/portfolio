const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sendContactNotification({ name, email, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_CONTACT,
    subject: `Nouveau message de ${safeName} — Portfolio`,
    html: `
      <h2>Nouveau message depuis le portfolio</h2>
      <p><strong>Nom :</strong> ${safeName}</p>
      <p><strong>Email :</strong> ${safeEmail}</p>
      <p><strong>Message :</strong></p>
      <p>${safeMessage}</p>
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
