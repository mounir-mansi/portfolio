// Pages « Site internet pour [métier] ». Chaque métier a son adresse (/fr/<slug>) et ses textes dans fr.json (metiers.<key>).
// Pour en ajouter un : une entrée ici, un bloc metiers.<key> dans fr.json, puis `npm run sitemap`.
export const METIERS = [
  {
    slug: "site-pizzeria",
    key: "pizzeria",
    // Site de démonstration montré sur la page (voir public/ pour l'image)
    demo: { name: "Il Subito", url: "https://ilsubito.mandev.fr", image: "/main-ilsubito.webp" },
  },
  {
    slug: "site-coiffeur-barbier",
    key: "barbier",
    demo: { name: "Le Cercle Barbier", url: "https://cerclebarbier.mandev.fr", image: "/main-cerclebarbier.webp" },
  },
  {
    slug: "site-restaurant",
    key: "restaurant",
    demo: null, // pas de site de démonstration dédié aux restaurants : la section est masquée
  },
  {
    slug: "site-boulangerie-patisserie",
    key: "boulangerie",
    demo: { name: "Gelateria Aurora", url: "https://gelateria-aurora.mandev.fr", image: "/main-demo-gelateria.webp" },
  },
  {
    slug: "site-artisan-batiment",
    key: "artisan",
    demo: null, // pas encore de site de démonstration pour ce métier : la section est masquée
  },
  {
    slug: "site-garage",
    key: "garage",
    demo: null,
  },
  {
    slug: "creation-site-internet-toulouse",
    key: "toulouse",
    demo: { name: "Le Cercle Barbier", url: "https://cerclebarbier.mandev.fr", image: "/main-cerclebarbier.webp" },
  },
];
