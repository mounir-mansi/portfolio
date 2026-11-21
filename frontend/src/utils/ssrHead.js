// Collecteur des balises <head> pendant le prérendu (scripts/prerender.mjs).
// Les hooks (titre, SEO, FAQ) y déposent leurs valeurs pendant le rendu serveur ; dans le navigateur il n'est jamais utilisé.
export const ssrHead = { title: null, description: null, canonical: null, robots: null, alternates: [], jsonld: [] };

// Écritures dans le collecteur (appelées pendant le rendu serveur uniquement)
export function collecterTitre(titre) { ssrHead.title = titre; }
export function collecterSeo({ canonical, alternates, description }) {
  ssrHead.canonical = canonical;
  ssrHead.alternates = alternates;
  if (description) ssrHead.description = description;
}
export function collecterJsonLd(id, data) { ssrHead.jsonld.push({ id, data }); }
// Page à ne pas indexer (ex. « noindex, nofollow ») : écrite dans le HTML prérendu, que Google lit avant tout JavaScript
export function collecterRobots(valeur) { ssrHead.robots = valeur; }

export function resetSsrHead() {
  ssrHead.title = null;
  ssrHead.description = null;
  ssrHead.canonical = null;
  ssrHead.robots = null;
  ssrHead.alternates = [];
  ssrHead.jsonld = [];
}

// Données structurées FAQPage (Google, assistants IA) à partir d'une liste { q, a }
export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
