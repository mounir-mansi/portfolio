// Propositions de la page /fr/proposition (lien personnalisé reçu dans un email de prospection).
// À garder identique à backend/src/lib/propositions.js : le serveur n'accepte que ces identifiants.

// Pôle 1 : « ce que je vous propose » (précoché, selon le commerce : paramètre ?o=forme,maintenance)
export const PROPOSITIONS = {
  forme: { label: "Remise en forme de votre site", detail: "Menu et pages remis en page, lisibles sur téléphone (refonte partielle)." },
  maintenance: { label: "Maintenance et mises à jour", detail: "Je m'occupe de votre site au quotidien : mises à jour, sécurité, sauvegardes." },
  vitesse: { label: "Accélérer votre site", detail: "Images allégées et chargement optimisé, sans changer l'allure du site." },
  terminer: { label: "Terminer votre site", detail: "Services, zone d'intervention, avis clients et formulaire de demande de devis." },
  moderniser: { label: "Moderniser votre site", detail: "Design actualisé et mise en avant de vos réalisations." },
  nouveau: { label: "Un nouveau site, à vous", detail: "Moderne, sur votre propre nom de domaine, sans publicité d'une autre marque." },
};

// Pôle 2 : « vous pouvez aussi ajouter » (jamais précoché)
export const AJOUTS = {
  reservation: { label: "Réservation en ligne", detail: "Vos clients réservent seuls, 24 h/24." },
  appel: { label: "Bouton d'appel direct", detail: "Un clic sur téléphone pour vous appeler." },
  contactform: { label: "Formulaire de contact", detail: "Les demandes arrivent directement dans votre boîte mail." },
  instagram: { label: "Fil Instagram intégré", detail: "Vos dernières publications affichées sur le site." },
  domaine: { label: "Nom de domaine à vous", detail: "Une adresse à votre nom, qui reste la vôtre." },
  referencement: { label: "Référencement local", detail: "Mieux ressortir sur Google Maps, avec les avis clients." },
  emailpro: { label: "Adresse email professionnelle", detail: "contact@votre-commerce.fr plutôt qu'une adresse gratuite." },
  admin: { label: "Espace d'administration", detail: "Vous modifiez vos horaires, photos et textes vous-même." },
  galerie: { label: "Galerie photos", detail: "Vos réalisations ou vos produits mis en valeur." },
  plan: { label: "Plan d'accès interactif", detail: "Une vraie carte, avec l'itinéraire en un clic." },
};

export const TOUTES = { ...PROPOSITIONS, ...AJOUTS };

// Cases précochées quand le lien n'indique rien (?o= absent ou inconnu)
export const PAR_DEFAUT = ["forme", "maintenance", "nouveau"];
