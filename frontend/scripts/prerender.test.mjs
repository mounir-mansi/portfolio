import { test } from "node:test";
import assert from "node:assert/strict";
import { composer, controler, routes, adresseApi, chargerApi, donneesPour } from "./prerender.mjs";

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

test("routes : avec l'API, listes et fiches de projets dans les 4 langues ; sans API, aucune page projet", () => {
  const r = routes({ projets: [7, 9] });
  for (const lang of ["fr", "en", "it", "es"]) for (const p of ["/projets", "/projets/7", "/projets/9"]) assert.ok(r.includes(`/${lang}${p}`), `${lang}${p}`);
  assert.equal(routes({ projets: [] }).filter((u) => u.includes("projets")).length, 4, "liste seule si aucun projet visible");
  assert.ok(!routes().some((u) => u.includes("projets")));
});

test("adresseApi : variable d'environnement, port du .env du backend, ou désactivée", () => {
  assert.equal(adresseApi({ PRERENDER_API: "http://10.0.0.5:4000/" }), "http://10.0.0.5:4000");
  assert.equal(adresseApi({ PRERENDER_API: "off" }, () => "PORT=3005"), null);
  assert.equal(adresseApi({}, () => "DATABASE_URL=x\nPORT=3005\nJWT=y\n"), "http://127.0.0.1:3005");
  assert.equal(adresseApi({}, () => ""), null);
});

const fauxFetch = (surcharge = {}) => async (url) => {
  const chemin = url.replace("http://api", "");
  const reponses = {
    "/api/skills": [{ category: "frontend", name: "React" }],
    "/api/projects?lang=fr": [{ id: 7 }], "/api/projects?lang=en": [{ id: 7 }], "/api/projects?lang=it": [{ id: 7 }], "/api/projects?lang=es": [{ id: 7 }],
    "/api/sections?lang=fr": { about: { text: "x" } }, "/api/sections?lang=en": {}, "/api/sections?lang=it": {}, "/api/sections?lang=es": {},
    ...Object.fromEntries(["fr", "en", "it", "es"].map((l) => [`/api/projects/7?lang=${l}`, { id: 7, title: `P-${l}` }])),
    ...surcharge,
  };
  if (!(chemin in reponses)) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => reponses[chemin] };
};

test("chargerApi + donneesPour : données par page, clés identiques à celles lues par utils/preload.js", async () => {
  const api = await chargerApi("http://api", fauxFetch());
  assert.deepEqual(Object.keys(donneesPour("/fr", api)), ["/api/projects?lang=fr"]);
  assert.deepEqual(Object.keys(donneesPour("/en/projets", api)), ["/api/projects?lang=en"]);
  assert.deepEqual(donneesPour("/es/projets/7", api), { "/api/projects/7?lang=es": { id: 7, title: "P-es" } });
  assert.deepEqual(Object.keys(donneesPour("/fr/a-propos", api)).sort(), ["/api/sections?lang=fr", "/api/skills"]);
  assert.deepEqual(donneesPour("/fr/contact", api), {}, "page sans données");
  assert.deepEqual(donneesPour("/fr", null), {});
});

test("chargerApi : API en panne ou réponse inattendue → null avec avertissement, sans casser le build", async () => {
  const avertissements = [];
  const avant = console.warn; console.warn = (m) => avertissements.push(m);
  try {
    assert.equal(await chargerApi("http://api", async () => { throw new Error("ECONNREFUSED"); }), null);
    assert.equal(await chargerApi("http://api", fauxFetch({ "/api/skills": { pas: "un tableau" } })), null);
    assert.equal(await chargerApi(null), null);
  } finally { console.warn = avant; }
  assert.equal(avertissements.length, 2);
  assert.match(avertissements[0], /API injoignable/);
});

test("composer : les données de l'API sont intégrées en JSON sûr, absentes si la page n'en a pas", () => {
  const avec = composer(MODELE, "/en/contact", rendu(), { "/api/skills": [{ name: "</script><b>x" }] });
  assert.match(avec, /<script type="application\/json" id="__preload">/);
  assert.ok(!avec.includes("</script><b>x"));
  assert.ok(!composer(MODELE, "/en/contact", rendu()).includes("__preload"));
});
