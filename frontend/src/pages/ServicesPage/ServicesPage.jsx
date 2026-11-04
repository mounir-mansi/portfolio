import { useEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import MaintenancePlans from "../../components/MaintenancePlans/MaintenancePlans";
import useReveal from "../../utils/useReveal";
import usePageTitle from "../../utils/usePageTitle";
import { collecterJsonLd, faqJsonLd } from "../../utils/ssrHead";
import { vatArticle } from "../../data/legal";
import { SERVICES, SERVICES_SLUG } from "../../data/services";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import "../MetierPage/MetierPage.css";
import "./ServicesPage.css";

// Page « Services » : ce qui entoure le site (maintenance, refonte, mises à jour, domaine et emails, traduction, référencement local).
// Les textes existent seulement en français : les autres langues renvoient vers la version française.
export default function ServicesPage() {
  const { lang = "fr" } = useParams();
  if (lang !== "fr") return <Navigate to={`/fr/${SERVICES_SLUG}`} replace />;
  return <ServicesContent />;
}

function ServicesContent() {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const s = (path, options) => t(`services_page.${path}`, options);

  usePageTitle(s("meta_title"));
  useReveal([i18n.language]);

  // Lien d'ancre (#maintenance…) : la page est prérendue, on défile une fois affichée
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  const items = s("items", { returnObjects: true });
  const faq = s("faq", { returnObjects: true });
  const ok = Array.isArray(items);

  // Prérendu : données structurées déposées dans le collecteur (les effets ne tournent pas côté serveur)
  if (import.meta.env.SSR && Array.isArray(faq) && faq.length > 0) collecterJsonLd("services-faq-jsonld", faqJsonLd(faq));
  if (import.meta.env.SSR) {
    const url = `https://mandev.fr/fr/${SERVICES_SLUG}`;
    collecterJsonLd("services-breadcrumb-jsonld", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ManDev Web", item: "https://mandev.fr/fr" },
        { "@type": "ListItem", position: 2, name: s("meta_title"), item: url },
      ],
    });
  }

  useEffect(() => {
    if (!Array.isArray(faq) || faq.length === 0) return;
    document.getElementById("services-faq-jsonld")?.remove(); // la page prérendue en contient déjà un
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "services-faq-jsonld";
    script.textContent = JSON.stringify(faqJsonLd(faq));
    document.head.appendChild(script);
    return () => script.remove();
  }, [faq]);

  if (!ok) return null;

  return (
    <Layout hideFooterCta>
      {/* HERO : le sommaire des six services se coche un par un à l'arrivée */}
      <section className="hero" aria-labelledby="services-title">
        <div className="container hero-grid svc-hero-grid">
          <div className="hero-main">
            <p className="eyebrow hero-eyebrow reveal">
              <span className="pulse" aria-hidden="true" /> {s("eyebrow")}
            </p>
            <h1 id="services-title" className="hero-title reveal" style={{ "--delay": "80ms" }}>
              {s("title_a")} <em>{s("title_em")}</em> {s("title_b")}
            </h1>
            <p className="hero-sub reveal" style={{ "--delay": "160ms" }}>{s("sub")}</p>
            <div className="hero-ctas reveal" style={{ "--delay": "240ms" }}>
              <Link to={{ pathname: "/fr", hash: "#devis" }} className="btn-primary">
                {s("cta")} <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/fr/contact" className="btn-outline">{s("cta_call")}</Link>
            </div>
            <div className="hero-call reveal" style={{ "--delay": "320ms" }}>
              <span className="hero-call-label">{t("home.call")}</span>
              <a className="hero-call-btn" href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
              <a className="hero-call-btn hero-call-btn--wa" href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>

          <nav className="svc-index" aria-label={s("index_aria")}>
            <p className="eyebrow svc-index-title">{s("index_title")}</p>
            <ol>
              {SERVICES.map((svc, i) => (
                <li key={svc.id} style={{ "--i": i }}>
                  <a href={`#${svc.id}`}>
                    <span className="svc-index-check" aria-hidden="true">✓</span>
                    <span className="svc-index-name">{items[i]?.name}</span>
                    <span className="svc-index-price">{items[i]?.price}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* LES SIX SERVICES */}
      {SERVICES.map((svc, i) => {
        const item = items[i];
        if (!item) return null;
        return (
          <section
            key={svc.id}
            id={svc.id}
            className={`block svc-block${i % 2 === 0 ? " block--raised" : ""}`}
            aria-labelledby={`svc-${svc.id}-title`}
          >
            <div className="container svc-grid">
              <div className="svc-text reveal">
                <h2 id={`svc-${svc.id}-title`} className="block-title">{item.name}</h2>
                <p className="svc-price">{item.price}</p>
                <p className="svc-desc">{item.desc}</p>
                {svc.page && (
                  <Link to={`/fr/${svc.page}`} className="svc-more">
                    {s("more")} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
              <ul className="metier-checks svc-points reveal" style={{ "--delay": "120ms" }}>
                {item.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>

            {/* Les trois niveaux de maintenance, juste sous le premier service */}
            {svc.id === "maintenance" && (
              <div className="container svc-plans-wrap">
                <MaintenancePlans />
              </div>
            )}
          </section>
        );
      })}

      <p className="container svc-vat">{t("home.price_note", { article: vatArticle() })}</p>

      {/* FAQ */}
      {Array.isArray(faq) && (
        <section className="block faq" aria-labelledby="services-faq-title">
          <div className="container faq-grid">
            <h2 id="services-faq-title" className="block-title reveal">{t("faq.title")}</h2>
            <div className="faq-list reveal" style={{ "--delay": "100ms" }}>
              {faq.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* APPEL À L'ACTION FINAL */}
      <section className="block metier-final" aria-labelledby="services-final-title">
        <div className="container metier-final-inner reveal">
          <h2 id="services-final-title" className="block-title">{s("final_title")}</h2>
          <p>{s("final_text")}</p>
          <Link to="/fr/contact" className="btn-primary">
            {t("nav.contact")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
