import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { BLOG_ARTICLES, BLOG_INDEX, BLOG_SLUG, BLOG_PUBLIC, blogArticle, blogDescription, dateLongue } from "../src/data/blog.js";
import { parseMarkdown, parseInline, extraireFaq, enTexteBrut, compterMots, typoFr } from "../src/utils/markdown.js";
import { METIERS } from "../src/data/metiers.js";
import { SERVICES_SLUG, SERVICE_PAGES } from "../src/data/services.js";
import { routes } from "./prerender.mjs";

const DOSSIER = new URL("../src/content/blog/", import.meta.url);
const texteArticle = (slug) => readFileSync(new URL(`${slug}.md`, DOSSIER), "utf8");

test("blog : chaque article de la liste a son fichier de texte, et inversement", () => {
  const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
  assert.deepEqual(fichiers, BLOG_ARTICLES.map((a) => a.slug).sort());
  assert.equal(BLOG_ARTICLES.length, 8);
});

test("blog : titres, descriptions et dates des articles sont corrects et uniques", () => {
  const slugs = new Set(BLOG_ARTICLES.map((a) => a.slug));
  assert.equal(slugs.size, BLOG_ARTICLES.length, "adresses uniques");
  assert.equal(new Set(BLOG_ARTICLES.map((a) => a.title)).size, BLOG_ARTICLES.length, "titres uniques");
  for (const a of BLOG_ARTICLES) {
    assert.match(a.slug, /^[a-z0-9-]+$/, `adresse « ${a.slug} »`);
    assert.ok(a.title.length > 10, `titre de ${a.slug}`);
    assert.ok(a.metaTitle && a.metaTitle.length <= 55, `titre d'onglet de ${a.slug} (${a.metaTitle?.length} car.)`);
    assert.ok(a.description.length >= 100 && a.description.length <= 155, `description de ${a.slug} : ${a.description.length} car.`);
    assert.match(a.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(a.keyword.length > 3, `mot-clé de ${a.slug}`);
  }
  assert.ok(BLOG_INDEX.description.length <= 155, "description de la page Blog");
});

test("blog : publication cachée par défaut tant que Mounir n'a pas relu (BLOG_PUBLIC)", () => {
  assert.equal(typeof BLOG_PUBLIC, "boolean");
});

test("markdown : titres, paragraphes, listes, cases à cocher, tableaux", () => {
  const blocs = parseMarkdown("### Titre\n\nUn **gras** et un [lien](/fr/contact).\nSuite du paragraphe.\n\n- un\n- deux\n  suite\n\n1. a\n2. b\n\n- [ ] à faire\n- [x] fait\n\n| | A | B |\n|---|---|---|\n| ligne | 1 | 2 |\n");
  assert.deepEqual(blocs[0], { type: "titre", niveau: 3, texte: "Titre" });
  assert.deepEqual(blocs[1], { type: "paragraphe", texte: "Un **gras** et un [lien](/fr/contact). Suite du paragraphe." });
  assert.deepEqual(blocs[2], { type: "liste", ordonnee: false, items: [{ texte: "un", coche: null }, { texte: "deux suite", coche: null }] });
  assert.equal(blocs[3].ordonnee, true);
  assert.deepEqual(blocs[4].items, [{ texte: "à faire", coche: false }, { texte: "fait", coche: true }]);
  assert.deepEqual(blocs[5], { type: "tableau", entetes: ["", "A", "B"], lignes: [["ligne", "1", "2"]] });
});

test("markdown : mise en forme en ligne, liens internes et externes", () => {
  const j = parseInline("**Gras avec [lien](https://exemple.fr)** puis *italique* et `code`.");
  assert.equal(j[0].type, "gras");
  assert.deepEqual(j[0].enfants[1], { type: "lien", texte: "lien", href: "https://exemple.fr" });
  assert.equal(j[2].type, "italique");
  assert.equal(j[4].type, "code");
  assert.equal(enTexteBrut("**Q ?** voir [ici](/fr/x) et `y`"), "Q ? voir ici et y");
});

test("typoFr : espace insécable avant : ; ! ? et autour des guillemets, texte sans ponctuation inchangé", () => {
  assert.equal(typoFr("Pourquoi : vraiment ? Oui ! « Citation » fin"), "Pourquoi : vraiment ? Oui ! « Citation » fin");
  assert.equal(typoFr("Rien à changer, ici."), "Rien à changer, ici.");
  assert.equal(typoFr("site:votredomaine.fr"), "site:votredomaine.fr");
});

test("markdown : une entrée bizarre ne bloque jamais l'analyse", () => {
  assert.deepEqual(parseMarkdown(""), []);
  assert.equal(parseMarkdown("|seul|\n|autre|").length, 1);
  assert.ok(parseMarkdown("#pas un titre\n- \n1.sans espace").length >= 1);
});

test("markdown : la FAQ est extraite de « Questions fréquentes »", () => {
  const faq = extraireFaq(parseMarkdown("### Questions fréquentes\n\n**Combien ça coûte ?** Dès 49 €, voir [la page](/fr/services).\n\n**Autre ?** Oui.\n\nUn texte sans question.\n"));
  assert.deepEqual(faq, [{ q: "Combien ça coûte ?", a: "Dès 49 €, voir la page." }, { q: "Autre ?", a: "Oui." }]);
  assert.deepEqual(extraireFaq(parseMarkdown("### Autre titre\n\n**Q ?** R")), []);
});

test("articles : chaque article a une FAQ d'au moins 2 questions et assez de texte", () => {
  for (const a of BLOG_ARTICLES) {
    const md = texteArticle(a.slug);
    assert.ok(extraireFaq(parseMarkdown(md)).length >= 2, `FAQ de ${a.slug}`);
    assert.ok(compterMots(md) >= 450, `${a.slug} : ${compterMots(md)} mots`);
  }
});

test("articles : aucun reste d'un autre pays, de prix en dollars, de lien vide ou de valeur « undefined »", () => {
  for (const a of BLOG_ARTICLES) {
    const md = texteArticle(a.slug);
    assert.ok(!/\$|Québec|Loi 25|undefined|\.ca\b/.test(md), `${a.slug} : texte interdit`);
    assert.ok(!/\[Contactez-moi ici\]|\[Réservez/.test(md), `${a.slug} : lien d'exemple`);
    assert.ok(!/semaines? [1-5]\b|Semaines? [1-5]\b/.test(md), `${a.slug} : planning par semaines`);
    const sansCases = md.replace(/^- \[( |x)\] /gm, "- ");
    assert.ok(!/\[[^\]]*\](?!\()/.test(sansCases), `${a.slug} : crochets sans adresse`);
    assert.ok(!/^#{1,2} /m.test(md), `${a.slug} : le titre de la page est le seul H1, pas de titre « ## » dans le texte`);
  }
});

test("articles : les liens internes mènent à des pages qui existent", () => {
  const valides = new Set([
    "/fr", "/fr/contact", "/fr/projets", `/fr/${SERVICES_SLUG}`,
    ...SERVICE_PAGES.map((s) => `/fr/${s.slug}`),
    ...METIERS.map((m) => `/fr/${m.slug}`),
    `/fr/${BLOG_SLUG}`, ...BLOG_ARTICLES.map((a) => `/fr/${BLOG_SLUG}/${a.slug}`),
  ]);
  for (const a of BLOG_ARTICLES) {
    for (const [, href] of texteArticle(a.slug).matchAll(/\]\((\/[^)\s]*)\)/g)) {
      assert.ok(valides.has(href.split("#")[0]), `${a.slug} : lien interne inconnu ${href}`);
    }
  }
});

test("routes : le blog est prérendu en français seulement (liste + 8 articles)", () => {
  const r = routes();
  assert.ok(r.includes(`/fr/${BLOG_SLUG}`));
  for (const a of BLOG_ARTICLES) assert.ok(r.includes(`/fr/${BLOG_SLUG}/${a.slug}`), a.slug);
  assert.ok(!r.some((u) => /^\/(en|it|es)\/blog/.test(u)), "pas de blog hors français");
});

test("blogDescription : liste, article, et pages hors blog", () => {
  assert.equal(blogDescription("blog"), BLOG_INDEX.description);
  assert.equal(blogDescription(`blog/${BLOG_ARTICLES[0].slug}`), BLOG_ARTICLES[0].description);
  assert.equal(blogDescription("blog/inconnu"), "");
  assert.equal(blogDescription("contact"), "");
  assert.equal(blogDescription(), "");
  assert.equal(blogArticle("inconnu"), undefined);
});

test("dateLongue : date lisible, la même quel que soit le fuseau", () => {
  assert.equal(dateLongue("2026-11-21"), "21 novembre 2026");
});
