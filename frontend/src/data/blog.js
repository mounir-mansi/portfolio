// Blog (français seulement). Le texte de chaque article est dans src/content/blog/<adresse>.md
// Fichier généré par Desktop/Prospection-Com/blog/generer-blog.mjs à partir de articles-8-version-finale.md :
// modifier les textes dans ce fichier source puis relancer le script. BLOG_PUBLIC est conservé d'une génération à l'autre
// (à modifier ici) ; BLOG_INDEX et les titres d'onglet se modifient dans le script lui-même.
export const BLOG_SLUG = "blog";

// Publication en deux temps :
//   false = relecture : pages en ligne mais cachées (« noindex », absentes du plan du site et du pied de page)
//   true  = publication : pages indexables, dans le plan du site et dans le pied de page
export const BLOG_PUBLIC = true;

export const BLOG_INDEX = {
  metaTitle: "Blog : conseils pour votre site internet",
  h1: "Conseils pour votre site internet",
  intro: "Des réponses simples aux questions que se posent les commerçants et les artisans avant de créer ou de refaire leur site.",
  description: "Conseils pour commerçants et artisans : coût d'un site internet, refonte, visibilité sur Google, étapes de création et checklist de lancement.",
};

export const BLOG_ARTICLES = [
  {
    "slug": "couts-caches-site-internet",
    "title": "Les coûts cachés d'un site internet : hébergement, nom de domaine et maintenance",
    "metaTitle": "Coûts cachés d'un site internet",
    "description": "Hébergement, nom de domaine, maintenance : découvrez les frais récurrents d'un site internet pour bien budgéter votre projet, sans mauvaise surprise.",
    "keyword": "coût hébergement site internet, nom de domaine",
    "date": "2026-11-21"
  },
  {
    "slug": "creer-son-site-soi-meme-ou-professionnel",
    "title": "Créer son site soi-même (Wix, Canva, Squarespace…) ou passer par un professionnel ?",
    "metaTitle": "Site Wix ou professionnel : que choisir ?",
    "description": "Wix, Canva ou développeur web ? Comparatif complet pour choisir la meilleure option selon votre budget, vos objectifs et votre stratégie SEO.",
    "keyword": "site internet Wix ou professionnel",
    "date": "2026-11-21"
  },
  {
    "slug": "site-vitrine-ou-e-commerce",
    "title": "Site vitrine ou site e-commerce : de quoi avez-vous vraiment besoin pour démarrer ?",
    "metaTitle": "Site vitrine ou e-commerce : que choisir ?",
    "description": "Site vitrine ou boutique en ligne ? Découvrez les différences clés et comment choisir la solution idéale pour lancer votre activité.",
    "keyword": "site vitrine ou e-commerce",
    "date": "2026-11-21"
  },
  {
    "slug": "refonte-site-internet-signes",
    "title": "7 signes qu'il est temps de refondre votre site internet",
    "metaTitle": "Refonte de site internet : 7 signes",
    "description": "Votre site ne vous rapporte plus de clients ? Voici 7 signaux d'alerte qui montrent qu'une refonte est nécessaire pour relancer votre activité.",
    "keyword": "refonte site internet",
    "date": "2026-11-21"
  },
  {
    "slug": "site-internet-invisible-google",
    "title": "Pourquoi votre site web n'apparaît pas sur Google (et comment y remédier)",
    "metaTitle": "Site internet pas sur Google : pourquoi ?",
    "description": "Votre site est en ligne mais invisible sur Google ? Découvrez les 5 blocages les plus fréquents et comment y remédier.",
    "keyword": "site internet pas sur Google",
    "date": "2026-11-21"
  },
  {
    "slug": "visiteurs-quittent-site-sans-contact",
    "title": "Pourquoi vos visiteurs quittent votre site sans vous contacter ?",
    "metaTitle": "Visiteurs qui ne contactent pas : pourquoi ?",
    "description": "Vous avez des visites sur votre site web mais aucun client ? Découvrez les erreurs d'expérience utilisateur et de persuasion qui font fuir vos prospects.",
    "keyword": "site internet qui ne convertit pas",
    "date": "2026-11-21"
  },
  {
    "slug": "creation-site-internet-etapes",
    "title": "Comment se déroule la création d'un site web de A à Z ? Les 5 étapes clés",
    "metaTitle": "Création de site internet : les 5 étapes",
    "description": "Créer un site internet, comment ça marche ? Découvrez les 5 étapes clés d'une collaboration réussie avec un développeur web.",
    "keyword": "étapes création site internet",
    "date": "2026-11-21"
  },
  {
    "slug": "checklist-lancement-site-internet",
    "title": "La checklist indispensable avant de lancer votre site internet",
    "metaTitle": "Checklist de lancement d'un site internet",
    "description": "Ne lancez pas votre site sans vérifier ces 10 points essentiels : la checklist complète (SEO, sécurité, mobile, légal) pour un lancement sans faute.",
    "keyword": "checklist lancement site internet",
    "date": "2026-11-21"
  }
];

export const blogArticle = (slug) => BLOG_ARTICLES.find((a) => a.slug === slug);

// Description SEO d'une page du blog à partir de sa route (« blog » ou « blog/<adresse> »)
export function blogDescription(route = "") {
  if (route === BLOG_SLUG) return BLOG_INDEX.description;
  if (!route.startsWith(`${BLOG_SLUG}/`)) return "";
  return blogArticle(route.slice(BLOG_SLUG.length + 1))?.description || "";
}

// Date lisible (« 21 novembre 2026 »), identique côté serveur et navigateur
export const dateLongue = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
