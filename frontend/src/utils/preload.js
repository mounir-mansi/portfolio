// Données de l'API intégrées dans les pages prérendues (scripts/prerender.mjs).
// Côté serveur (prérendu) elles viennent de globalThis.__PRERENDER_DATA__ ; dans le navigateur, du bloc JSON
// <script id="__preload"> de la page. Les pages démarrent avec ces données (le HTML est identique à celui reçu),
// puis rafraîchissent depuis l'API comme avant. Clé = chemin de l'API, ex. « /api/projects?lang=fr ».
let cache;

function lireNavigateur() {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(document.getElementById("__preload")?.textContent || "{}");
  } catch {
    cache = {};
  }
  return cache;
}

export function preloaded(path) {
  const store = typeof document === "undefined" ? globalThis.__PRERENDER_DATA__ : lireNavigateur();
  return store && Object.prototype.hasOwnProperty.call(store, path) ? store[path] : undefined;
}
