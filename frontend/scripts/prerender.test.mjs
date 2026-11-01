import { test } from "node:test";
import assert from "node:assert/strict";
import { composer, controler, routes } from "./prerender.mjs";

const MODELE = `<!doctype html>
<html lang="fr">
  <head>
    <title>Ancien titre</title>
    <meta name="description" content="ancienne description" />
    <meta property="og:title" content="ancien" />
    <meta property="og:description" content="ancien" />
    <meta property="og:url" content="https://mandev.fr" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:image" content="https://mandev.fr/og-image.png" />
    <meta name="twitter:title" content="ancien" />
    <meta name="twitter:description" content="ancien" />
    <link rel="canonical" href="https://mandev.fr/fr" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
const MOTS = Array.from({ length: 80 }, (_, i) => `mot${i}`).join(" ");
const rendu = (surcharge = {}) => ({
  html: `<h1>Titre</h1><p>${MOTS}</p>`,
  head: {
    title: 'Page "test" — <ManDev>', description: "Une description & plus", canonical: "https://mandev.fr/en/contact",
    alternates: [["fr", "https://mandev.fr/fr/contact"], ["en", "https://mandev.fr/en/contact"], ["it", "https://mandev.fr/it/contact"], ["es", "https://mandev.fr/es/contact"], ["x-default", "https://mandev.fr/fr/contact"]],
    jsonld: [{ id: "faq-jsonld", data: { "@type": "FAQPage", note: "</script><b>" } }], ...surcharge,
  },
});

test("composer : remplace les balises de la page, garde les autres, langue et contenu en place", () => {
  const page = composer(MODELE, "/en/contact", rendu());
  assert.match(page, /<html lang="en"/);
  assert.match(page, /<title>Page &quot;test&quot; — &lt;ManDev&gt;<\/title>/);
  assert.match(page, /<meta property="og:locale" content="en_GB" \/>/);
  assert.match(page, /<meta property="og:image" content="https:\/\/mandev\.fr\/og-image\.png" \/>/, "og:image du site conservé");
  assert.ok(!page.includes("ancien"), "aucune ancienne valeur");
  assert.match(page, /<div id="root"><h1>Titre<\/h1>/);
  controler("/en/contact", page);
});

test("composer : le JSON-LD ne peut pas fermer la balise script", () => {
  const page = composer(MODELE, "/en/contact", rendu());
  assert.ok(!page.includes("</script><b>"));
  assert.match(page, /<script type="application\/ld\+json" id="faq-jsonld">.*\u003c\/script>/);
});

test("composer : refuse une page sans titre ou sans adresse canonique", () => {
  assert.throws(() => composer(MODELE, "/fr", rendu({ title: null })), /aucun titre/);
  assert.throws(() => composer(MODELE, "/fr", rendu({ canonical: null })), /canonique/);
  assert.throws(() => composer("<html><head></head><body></body></html>", "/fr", rendu()), /root/);
});

test("controler : détecte doublons, page vide, undefined et langue", () => {
  const bonne = composer(MODELE, "/en/contact", rendu());
  assert.throws(() => controler("/en/contact", bonne.replace("</head>", '<link rel="canonical" href="x" /></head>')), /canonical : 2/);
  assert.throws(() => controler("/en/contact", composer(MODELE, "/en/contact", rendu({ alternates: [] }))), /hreflang/);
  assert.throws(() => controler("/en/contact", composer(MODELE, "/en/contact", { ...rendu(), html: "<h1>vide</h1>" })), /mots de contenu/);
  assert.throws(() => controler("/en/contact", composer(MODELE, "/en/contact", { ...rendu(), html: `<h1>x</h1><p>${MOTS}</p><p>undefined</p>` })), /undefined/);
  assert.throws(() => controler("/fr/contact", bonne), /lang absent/);
});

test("routes : 4 langues × 6 pages + pages par métier en français seulement", () => {
  const r = routes();
  assert.ok(r.includes("/fr") || r.includes("/fr/") === false);
  for (const lang of ["fr", "en", "it", "es"]) for (const p of ["", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgv"]) assert.ok(r.includes(`/${lang}${p}`), `${lang}${p}`);
  assert.ok(r.includes("/fr/site-pizzeria") && r.includes("/fr/site-coiffeur-barbier"));
  assert.ok(!r.some((u) => /^\/(en|it|es)\/site-/.test(u)), "pas de page métier hors français");
  assert.ok(!r.some((u) => u.includes("projets")), "pages dépendant de la base : non prérendues");
});
