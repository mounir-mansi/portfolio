import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { collecterSeo } from "./ssrHead";

const SITE = "https://mandev.fr";
const LANGS = ["fr", "en", "it", "es"];

// Balises SEO propres à chaque page et langue : canonical, hreflang (4 langues) et description.
export default function useSeoTags(lang, route) {
  const { t, i18n } = useTranslation();

  // Une page peut avoir sa propre description (seo.<route>), sinon celle du site
  const own = route ? t(`seo.${route}`, { defaultValue: "" }) : "";
  const description = own || t("meta.description");

  // Prérendu : mêmes valeurs que celles posées par les effets ci-dessous, déposées dans le collecteur
  if (import.meta.env.SSR && LANGS.includes(lang)) {
    const path = route ? `/${route}` : "";
    collecterSeo({
      canonical: `${SITE}/${lang}${path}`,
      alternates: [...LANGS.map((l) => [l, `${SITE}/${l}${path}`]), ["x-default", `${SITE}/fr${path}`]],
      description: description !== "meta.description" ? description : null,
    });
  }

  useEffect(() => {
    if (!LANGS.includes(lang)) return;
    const path = route ? `/${route}` : "";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE}/${lang}${path}`;

    // Les pages prérendues ont déjà leurs hreflang : on les remplace pour éviter les doublons
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
    const alternates = [...LANGS.map((l) => [l, `${SITE}/${l}${path}`]), ["x-default", `${SITE}/fr${path}`]];
    const created = alternates.map(([hreflang, href]) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => created.forEach((link) => link.remove());
  }, [lang, route]);

  useEffect(() => {
    if (!description || description === "meta.description") return;
    ["meta[name='description']", "meta[property='og:description']", "meta[name='twitter:description']"].forEach((selector) => {
      document.querySelector(selector)?.setAttribute("content", description);
    });
    // og:title / twitter:title suivent le titre de l'onglet ; og:url et og:locale suivent la page
    const path = route ? `/${route}` : "";
    document.querySelector("meta[property='og:url']")?.setAttribute("content", `${SITE}/${lang}${path}`);
  }, [description, i18n.language, route, lang]);
}
