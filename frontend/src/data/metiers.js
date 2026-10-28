// Pages « Site internet pour [métier] ». Chaque métier a son adresse (/fr/<slug>) et ses textes dans fr.json (metiers.<key>).
// Pour en ajouter un : une entrée ici, un bloc metiers.<key> dans fr.json, puis `npm run sitemap`.
export const METIERS = [
  {
    slug: "site-pizzeria",
    key: "pizzeria",
    // Site de démonstration montré sur la page (voir public/ pour l'image)
    demo: { name: "Il Subito", url: "https://ilsubito.mandev.fr", image: "/main-ilsubito.png" },
  },
];
