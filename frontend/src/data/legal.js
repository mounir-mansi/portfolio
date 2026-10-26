import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "../utils/contactInfo";

// Données utilisées par les pages Mentions légales, Confidentialité et CGV.
// À mettre à jour ici uniquement : les trois pages les reprennent.
export const LEGAL = {
  brand: "ManDev Web",
  publisher: "Mounir Mansi",
  status: "Entrepreneur individuel (micro-entreprise)",
  siren: "794 472 613",
  // SIRET (14 chiffres : SIREN + 5 chiffres d'établissement) : à ajouter si tu veux l'afficher
  siret: "",
  vat: "TVA non applicable, article 293 B du Code général des impôts",
  // OBLIGATOIRE pour un site professionnel : adresse professionnelle déclarée ou de domiciliation.
  // Tant qu'elle est vide, la ligne n'apparaît pas et `npm run build` affiche un avertissement.
  address: "",
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
