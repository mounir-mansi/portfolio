// Pages « Site internet pour [métier] ». Chaque métier a son adresse (/fr/<slug>) et ses textes dans fr.json (metiers.<key>).
// Pour en ajouter un : une entrée ici, un bloc metiers.<key> dans fr.json, puis `npm run sitemap`.
// Chemin (sans extension) des fichiers générés par scripts/enregistrer-demos.mjs : /demos/<sous-domaine>.webp (affiche) et .webm (vidéo)
export const demoMedia = (m) => `/demos/${new URL(m.demo.url).hostname.split(".")[0]}`;

// Les métiers demandés, dans l'ordre des clés (ex. metiersParCle(["restaurant", "barbier"]))
export const metiersParCle = (cles) => cles.map((cle) => METIERS.find((m) => m.key === cle));

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
    demo: { name: "Maison Camille", url: "https://restaurant.mandev.fr", image: "/main-restaurant.webp" },
  },
  {
    slug: "site-boulangerie-patisserie",
    key: "boulangerie",
    demo: { name: "Maison Lévain", url: "https://boulangerie.mandev.fr", image: "/main-boulangerie.webp" },
  },
  {
    slug: "site-artisan-batiment",
    key: "artisan",
    demo: { name: "Garonne Plomberie Chauffage", url: "https://plombier.mandev.fr", image: "/main-plombier.webp" },
  },
  {
    slug: "site-garage",
    key: "garage",
    demo: { name: "Garage du Canal", url: "https://garage.mandev.fr", image: "/main-garage.webp" },
  },
  {
    slug: "creation-site-internet-toulouse",
    key: "toulouse",
    demo: { name: "Le Cercle Barbier", url: "https://cerclebarbier.mandev.fr", image: "/main-cerclebarbier.webp" },
  },
];
