// Génère public/sitemap.xml (4 langues, avec hreflang). À relancer quand on ajoute une page : npm run sitemap
// Les pages de détail de projet (/projets/:id) viennent de la base : elles ne sont pas listées ici.
import { readFileSync, writeFileSync } from "node:fs";
import { METIERS } from "../src/data/metiers.js";
import { SERVICES_SLUG } from "../src/data/services.js";

const SITE = "https://mandev.fr";
const LANGS = ["fr", "en", "it", "es"];
const PAGES = ["", "/projets", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgv"];

const entry = (lang, page) => {
  const alternates = [
    ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${page}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/fr${page}"/>`,
  ].join("\n");
  return `  <url>\n    <loc>${SITE}/${lang}${page}</loc>\n${alternates}\n  </url>`;
};

// Pages par métier : en français seulement (les autres langues renvoient vers la version française)
const metierUrls = METIERS.map((m) => `  <url>
    <loc>${SITE}/fr/${m.slug}</loc>
  </url>`);

// Page Services : en français seulement, comme les pages par métier
const servicesUrl = `  <url>
    <loc>${SITE}/fr/${SERVICES_SLUG}</loc>
  </url>`;

const urls = [...PAGES.flatMap((page) => LANGS.map((lang) => entry(lang, page))), servicesUrl, ...metierUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`sitemap.xml écrit : ${urls.length} URL`);

// llms.txt : la liste des pages par activité et par zone suit METIERS (entre les repères <!-- metiers:debut --> et <!-- metiers:fin -->)
const fr = JSON.parse(readFileSync(new URL("../src/i18n/locales/fr.json", import.meta.url), "utf8"));
const fichierLlms = new URL("../public/llms.txt", import.meta.url);
const liste = METIERS.map((m) => `- [${fr.metiers[m.key].meta_title}](${SITE}/fr/${m.slug})`).join("\n");
const llms = readFileSync(fichierLlms, "utf8");
const debut = "<!-- metiers:debut -->";
const fin = "<!-- metiers:fin -->";
if (!llms.includes(debut) || !llms.includes(fin)) throw new Error("repères metiers:debut / metiers:fin absents de public/llms.txt");
const avant = llms.slice(0, llms.indexOf(debut) + debut.length);
const apres = llms.slice(llms.indexOf(fin));
writeFileSync(fichierLlms, `${avant}\n${liste}\n${apres}`);
console.log(`llms.txt mis à jour : ${METIERS.length} pages par activité et par zone`);
