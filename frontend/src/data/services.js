// Page « Services » (/fr/services) : les prestations autour du site. Les textes et les prix sont dans fr.json (services_page).
// Chaque id sert d'ancre dans la page (#maintenance…) et de clé dans services_page.items.
// `page` : adresse de la page dédiée au service (voir SERVICE_PAGES), quand elle existe.
export const SERVICES = [
  { id: "maintenance", page: "maintenance-site-internet" },
  { id: "refonte", page: "refonte-site-internet" },
  { id: "contenu" },
  { id: "domaine-email" },
  { id: "traduction" },
  { id: "seo-local", page: "referencement-local" },
];

export const SERVICES_SLUG = "services";

// Pages dédiées à un service (/fr/<slug>). Les textes sont dans fr.json (service_pages.<key>).
// multilang : page traduite dans les 4 langues (les autres ne le sont qu'en français).
// plans : la page affiche les trois niveaux de maintenance plutôt qu'une liste de prix.
export const SERVICE_PAGES = [
  { slug: "maintenance-site-internet", key: "maintenance", plans: true },
  { slug: "refonte-site-internet", key: "refonte" },
  { slug: "referencement-local", key: "referencement" },
  { slug: "fonctions-sur-mesure", key: "fonctions", multilang: true },
];

// Page « Aller plus loin » liée depuis /fr/services
export const FONCTIONS_PAGE = "fonctions-sur-mesure";
