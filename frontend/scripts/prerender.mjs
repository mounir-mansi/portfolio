// Prérendu : après « vite build », écrit le HTML complet de chaque page publique (contenu + balises SEO) dans dist/.
// Pourquoi : le site est une application React ; sans cela, le HTML reçu par Google (avant JavaScript), par les robots
// des assistants IA (qui n'exécutent pas le JavaScript) et par les aperçus de partage est une page vide.
// nginx sert dist/fr/index.html pour /fr grâce à « try_files $uri $uri/ /index.html » (aucun changement de config).
// Les pages qui dépendent de la base (liste et détail des projets) restent rendues dans le navigateur.
import { createServer } from "vite";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { METIERS } from "../src/data/metiers.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RACINE, "dist");
const LANGS = ["fr", "en", "it", "es"];
const LOCALES = { fr: "fr_FR", en: "en_GB", it: "it_IT", es: "es_ES" };
const PAGES = ["", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgv"];

const echapper = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

export function routes() {
  const base = LANGS.flatMap((lang) => PAGES.map((p) => `/${lang}${p}`));
  const metiers = METIERS.map((m) => `/fr/${m.slug}`); // pages par métier : français seulement
  return [...base, ...metiers];
}

// Remplace les balises de tête propres à la page ; garde les autres (icônes, og:image, twitter:card, JSON-LD du site)
export function composer(modele, url, rendu) {
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
  return page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
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
    let n = 0;
    for (const url of routes()) {
      const rendu = await render(url);
      if (rendu.html.length < 500) throw new Error(`${url} : contenu rendu trop court (${rendu.html.length} octets)`);
      const dossier = join(DIST, ...url.split("/").filter(Boolean));
      mkdirSync(dossier, { recursive: true });
      const page = composer(modele, url, rendu);
      controler(url, page);
      writeFileSync(join(dossier, "index.html"), page);
      n++;
    }
    console.log(`prérendu : ${n} pages écrites dans dist/`);
  } finally {
    await vite.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal().catch((e) => { console.error("prérendu en échec :", e.message); process.exit(1); });
}
