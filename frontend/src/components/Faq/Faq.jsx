import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { collecterJsonLd, faqJsonLd } from "../../utils/ssrHead";
import "./Faq.css";

// FAQ accessible (éléments <details> natifs) + données structurées FAQPage pour Google
export default function Faq() {
  const { t, i18n } = useTranslation();
  const items = t("faq.items", { returnObjects: true });
  const list = Array.isArray(items) ? items : [];

  // Prérendu : les données structurées sont déposées dans le collecteur (les effets ne tournent pas côté serveur)
  if (import.meta.env.SSR && list.length > 0) collecterJsonLd("faq-jsonld", faqJsonLd(list));

  useEffect(() => {
    const entries = t("faq.items", { returnObjects: true });
    if (!Array.isArray(entries) || entries.length === 0) return;
    document.getElementById("faq-jsonld")?.remove(); // la page prérendue en contient déjà un
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.textContent = JSON.stringify(faqJsonLd(entries));
    document.head.appendChild(script);
    return () => script.remove();
  }, [i18n.language, t]);

  if (list.length === 0) return null;

  return (
    <section id="faq" className="block faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <h2 id="faq-title" className="block-title reveal">{t("faq.title")}</h2>
        <div className="faq-list reveal" style={{ "--delay": "100ms" }}>
          {list.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
