import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SITE = "https://mandev.fr";
const LANGS = ["fr", "en", "it", "es"];

// Balises SEO propres à chaque page et langue : canonical, hreflang (4 langues) et description.
export default function useSeoTags(lang, route) {
  const { t, i18n } = useTranslation();

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
    // Une page peut avoir sa propre description (seo.<route>), sinon celle du site
    const own = route ? t(`seo.${route}`, { defaultValue: "" }) : "";
    const description = own || t("meta.description");
    if (!description || description === "meta.description") return;
    ["meta[name='description']", "meta[property='og:description']", "meta[name='twitter:description']"].forEach((selector) => {
      document.querySelector(selector)?.setAttribute("content", description);
    });
  }, [t, i18n.language, route]);
}
