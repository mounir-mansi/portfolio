import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "../utils/contactInfo";

// Données utilisées par les pages Mentions légales, Confidentialité et CGV.
// À mettre à jour ici uniquement : les trois pages les reprennent.
export const LEGAL = {
  brand: "ManDev Web",
  publisher: "Mounir Mansi",
  status: "Entrepreneur individuel (micro-entreprise)",
  siren: "794 472 613",
  siret: "794 472 613 00023",
  // OBLIGATOIRE pour un site professionnel : adresse professionnelle déclarée ou de domiciliation.
  // Tant qu'elle est vide, la ligne n'apparaît pas et `npm run build` affiche un avertissement.
  address: "121 boulevard National, 13003 Marseille",
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE_DISPLAY,
  host: {
    name: "IONOS SARL",
    address: "7 place de la Gare, BP 70109, 57200 Sarreguemines Cedex, France",
    phone: "0970 808 911",
  },
  updated: "26 octobre 2026",
  jurisdiction: "Toulouse",
};

// Franchise en base de TVA (micro-entreprise). Le code des impôts est recodifié : d'après impots.gouv.fr,
// la référence « article L. 223-3 du CIBS » s'applique à partir du 1er janvier 2027 ; avant, l'article 293 B du CGI.
const CIBS_FROM = new Date("2027-01-01T00:00:00");

export const vatArticle = () =>
  Date.now() >= CIBS_FROM.getTime() ? "article L. 223-3 du CIBS" : "article 293 B du CGI";

export const vatMention = () => `TVA non applicable, ${vatArticle()}`;
