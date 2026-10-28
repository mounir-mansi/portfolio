// Génère public/sitemap.xml (4 langues, avec hreflang). À relancer quand on ajoute une page : npm run sitemap
// Les pages de détail de projet (/projets/:id) viennent de la base : elles ne sont pas listées ici.
import { writeFileSync } from "node:fs";
import { METIERS } from "../src/data/metiers.js";

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

const urls = [...PAGES.flatMap((page) => LANGS.map((lang) => entry(lang, page))), ...metierUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`sitemap.xml écrit : ${urls.length} URL`);
