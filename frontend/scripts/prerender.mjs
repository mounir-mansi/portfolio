// Prérendu : après « vite build », écrit le HTML complet de chaque page publique (contenu + balises SEO) dans dist/.
// Pourquoi : le site est une application React ; sans cela, le HTML reçu par Google (avant JavaScript), par les robots
// des assistants IA (qui n'exécutent pas le JavaScript) et par les aperçus de partage est une page vide.
// nginx sert dist/fr/index.html pour /fr grâce à « try_files $uri $uri/ /index.html » (aucun changement de config).
// Les pages qui dépendent de la base (projets, texte « À propos », compétences) sont prérendues avec les vraies données :
// le script interroge l'API du portfolio (port lu dans ../backend/.env, ou PRERENDER_API=http://hôte:port ; PRERENDER_API=off
// pour s'en passer). Si l'API est injoignable, ces pages restent rendues dans le navigateur, comme avant : le build ne casse pas.
import { createServer } from "vite";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { METIERS } from "../src/data/metiers.js";
import { SERVICES_SLUG, SERVICE_PAGES } from "../src/data/services.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RACINE, "dist");
const LANGS = ["fr", "en", "it", "es"];
const LOCALES = { fr: "fr_FR", en: "en_GB", it: "it_IT", es: "es_ES" };
const PAGES = ["", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgv"];

const echapper = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

// projets : liste des numéros de projets visibles si l'API a répondu, null sinon (pages projets non prérendues)
export function routes({ projets = null } = {}) {
  const base = LANGS.flatMap((lang) => PAGES.map((p) => `/${lang}${p}`));
  const metiers = METIERS.map((m) => `/fr/${m.slug}`); // pages par métier : français seulement
  const pagesProjets = projets === null ? [] : LANGS.flatMap((lang) => [`/${lang}/projets`, ...projets.map((id) => `/${lang}/projets/${id}`)]);
  const services = [SERVICES_SLUG, ...SERVICE_PAGES.map((s) => s.slug)].map((slug) => `/fr/${slug}`); // pages Services : français seulement
  const traduites = SERVICE_PAGES.filter((s) => s.multilang).flatMap((s) => LANGS.filter((l) => l !== "fr").map((l) => `/${l}/${s.slug}`)); // sauf celles traduites
  return [...base, ...services, ...traduites, ...metiers, ...pagesProjets];
}

// Lecture de l'API du portfolio ; renvoie null (avec un avertissement) si elle est injoignable ou répond de travers
export function adresseApi(env = process.env, lireFichier = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "")) {
  if (env.PRERENDER_API === "off") return null;
  if (env.PRERENDER_API) return env.PRERENDER_API.replace(/\/$/, "");
  const port = lireFichier(join(RACINE, "..", "backend", ".env")).match(/^PORT=(\d+)\s*$/m)?.[1];
  return port ? `http://127.0.0.1:${port}` : null;
}

export async function chargerApi(base, fetchImpl = fetch) {
  if (!base) return null;
  const get = async (chemin) => {
    const r = await fetchImpl(`${base}${chemin}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`${chemin} : HTTP ${r.status}`);
    return r.json();
  };
  try {
    const donnees = { projets: {}, details: {}, sections: {}, competences: await get("/api/skills") };
    if (!Array.isArray(donnees.competences)) throw new Error("/api/skills : réponse inattendue");
    for (const lang of LANGS) {
      const liste = await get(`/api/projects?lang=${lang}`);
      if (!Array.isArray(liste)) throw new Error(`/api/projects?lang=${lang} : réponse inattendue`);
      donnees.projets[lang] = liste;
      donnees.sections[lang] = await get(`/api/sections?lang=${lang}`);
      for (const p of liste) donnees.details[`${p.id}:${lang}`] = await get(`/api/projects/${p.id}?lang=${lang}`);
    }
    return donnees;
  } catch (e) {
    console.warn(`prérendu : API injoignable (${base}) : ${e.message}. Pages projets, À propos et accueil prérendues sans données.`);
    return null;
  }
}

// Données de l'API à intégrer dans la page (clé = chemin de l'API, comme dans utils/preload.js)
export function donneesPour(url, api) {
  if (!api) return {};
  const [, lang, page, id] = url.split("/");
  const d = {};
  if (page === undefined) d[`/api/projects?lang=${lang}`] = api.projets[lang];
  if (page === "projets" && id === undefined) d[`/api/projects?lang=${lang}`] = api.projets[lang];
  if (page === "projets" && id !== undefined) d[`/api/projects/${id}?lang=${lang}`] = api.details[`${id}:${lang}`];
  if (page === "a-propos") { d[`/api/sections?lang=${lang}`] = api.sections[lang]; d["/api/skills"] = api.competences; }
  return d;
}

// Remplace les balises de tête propres à la page ; garde les autres (icônes, og:image, twitter:card, JSON-LD du site)
export function composer(modele, url, rendu, donnees = {}) {
  const lang = url.split("/")[1];
  const { html, head } = rendu;
  const titre = head.title || null;
  if (!titre) throw new Error(`${url} : aucun titre collecté pendant le rendu`);
  if (!head.canonical) throw new Error(`${url} : aucune adresse canonique collectée`);

  let page = modele
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/, "")
    .replace(/<meta property="og:(title|description|url|locale)"[^>]*>\s*/g, "")
    .replace(/<meta name="twitter:(title|description)"[^>]*>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/, "");

  const description = head.description || "";
  const balises = [
    `<title>${echapper(titre)}</title>`,
    `<meta name="description" content="${echapper(description)}" />`,
    `<link rel="canonical" href="${echapper(head.canonical)}" />`,
    ...head.alternates.map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${echapper(href)}" />`),
    `<meta property="og:title" content="${echapper(titre)}" />`,
    `<meta property="og:description" content="${echapper(description)}" />`,
    `<meta property="og:url" content="${echapper(head.canonical)}" />`,
    `<meta property="og:locale" content="${LOCALES[lang]}" />`,
    `<meta name="twitter:title" content="${echapper(titre)}" />`,
    `<meta name="twitter:description" content="${echapper(description)}" />`,
    ...head.jsonld.map((j) => `<script type="application/ld+json" id="${j.id}">${json(j.data)}</script>`),
  ].map((l) => `    ${l}`).join("\n");

  if (!page.includes("</head>")) throw new Error("modèle sans </head>");
  page = page.replace("</head>", `${balises}\n  </head>`);
  if (!page.includes('<div id="root"></div>')) throw new Error("modèle sans <div id=\"root\"></div>");
  // Données de l'API reprises telles quelles par le navigateur (même contenu que le HTML : pas de décalage à l'hydratation)
  const preload = Object.keys(donnees).length ? `
    <script type="application/json" id="__preload">${json(donnees)}</script>` : "";
  return page.replace('<div id="root"></div>', `<div id="root">${html}</div>${preload}`);
}

// Contrôle de chaque page écrite : une page cassée fait échouer le build plutôt que d'être publiée
export function controler(url, page) {
  const compte = (re) => (page.match(re) || []).length;
  const problemes = [];
  const unique = [["<title>", /<title>/g], ["description", /<meta name="description"/g], ["canonical", /<link rel="canonical"/g], ["og:title", /<meta property="og:title"/g], ["og:url", /<meta property="og:url"/g]];
  for (const [nom, re] of unique) if (compte(re) !== 1) problemes.push(`${nom} : ${compte(re)} exemplaire(s) au lieu de 1`);
  if (compte(/<link rel="alternate" hreflang=/g) !== 5) problemes.push("hreflang : 5 attendus");
  if (compte(/<h1[ >]/g) < 1) problemes.push("aucun titre H1 dans le HTML");
  if (/>\s*undefined\s*</.test(page) || /content="undefined"/.test(page)) problemes.push("valeur « undefined » dans le HTML");
  const texte = page.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
  const mots = texte.split(/\s+/).filter(Boolean).length;
  if (mots < 50) problemes.push(`seulement ${mots} mots de contenu`);
  const lang = url.split("/")[1];
  if (!page.includes(`<html lang="${lang}"`)) problemes.push(`attribut lang absent (${lang})`);
  if (problemes.length) throw new Error(`${url} : ${problemes.join(" ; ")}`);
}

async function principal() {
  const fichierModele = join(DIST, "index.html");
  if (!existsSync(fichierModele)) throw new Error("dist/index.html introuvable : lancer « vite build » d'abord");
  const modele = readFileSync(fichierModele, "utf8");

  const vite = await createServer({ root: RACINE, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
  try {
    const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
    const api = await chargerApi(adresseApi());
    const projets = api ? api.projets.fr.map((p) => p.id) : null;
    let n = 0;
    for (const url of routes({ projets })) {
      const donnees = donneesPour(url, api);
      globalThis.__PRERENDER_DATA__ = donnees;
      const rendu = await render(url);
      if (rendu.html.length < 500) throw new Error(`${url} : contenu rendu trop court (${rendu.html.length} octets)`);
      const dossier = join(DIST, ...url.split("/").filter(Boolean));
      mkdirSync(dossier, { recursive: true });
      const page = composer(modele, url, rendu, donnees);
      controler(url, page);
      writeFileSync(join(dossier, "index.html"), page);
      n++;
    }
    globalThis.__PRERENDER_DATA__ = undefined;
    console.log(`prérendu : ${n} pages écrites dans dist/${api ? ` (données de l'API : ${projets.length} projets)` : " (sans données de l'API)"}`);
  } finally {
    await vite.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal().catch((e) => { console.error("prérendu en échec :", e.message); process.exit(1); });
}
