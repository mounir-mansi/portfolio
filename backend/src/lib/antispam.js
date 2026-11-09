// Outils anti-spam partagés par les formulaires publics (contact, avis).

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// Champ piège invisible (seuls les robots le remplissent) et refus des liens dans les champs texte.
// Un vrai visiteur n'écrit presque jamais d'adresse web dans une demande de contact ou un avis.
const HONEYPOT_FIELD = "website_url_check";
const LINK_REGEX = /(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\/\S+/i;
const hasLink = (...values) => values.some((v) => LINK_REGEX.test(v));

module.exports = { clean, HONEYPOT_FIELD, LINK_REGEX, hasLink };
