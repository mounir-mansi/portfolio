// Intitulés des propositions de la page /fr/proposition. Le serveur n'accepte que ces identifiants.
// À garder identique à frontend/src/data/propositions.js.

// Pôle 1 : « ma proposition » (précochée selon le commerce)
const PROPOSITIONS = {
  forme: "Remise en forme / refonte partielle du site",
  maintenance: "Maintenance et mises à jour",
  vitesse: "Accélérer le site",
  terminer: "Terminer le site",
  moderniser: "Moderniser le design",
  nouveau: "Nouveau site à moi",
};

// Pôle 2 : ce que le commerçant peut ajouter
const AJOUTS = {
  reservation: "Réservation en ligne",
  appel: "Bouton d'appel direct",
  contactform: "Formulaire de contact",
  instagram: "Fil Instagram intégré",
  domaine: "Nom de domaine à moi",
  referencement: "Référencement local (Google Maps, avis)",
  emailpro: "Adresse email professionnelle",
  admin: "Espace d'administration",
  galerie: "Galerie photos",
  plan: "Plan d'accès interactif",
};

const LABELS = { ...PROPOSITIONS, ...AJOUTS };

module.exports = { PROPOSITIONS, AJOUTS, LABELS };
