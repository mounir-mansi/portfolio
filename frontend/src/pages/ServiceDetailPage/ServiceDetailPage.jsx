import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import MaintenancePlans from "../../components/MaintenancePlans/MaintenancePlans";
import useReveal from "../../utils/useReveal";
import usePageTitle from "../../utils/usePageTitle";
import { collecterJsonLd, faqJsonLd } from "../../utils/ssrHead";
import { vatArticle } from "../../data/legal";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import "../MetierPage/MetierPage.css";
import "../ServicesPage/ServicesPage.css";

// Page dédiée à un service (refonte, maintenance, référencement local) : même structure pour les trois, textes dans fr.json (service_pages.<key>).
// Les textes existent seulement en français : les autres langues renvoient vers la version française.
export default function ServiceDetailPage({ service }) {
  const { lang = "fr" } = useParams();
  if (lang !== "fr") return <Navigate to={`/fr/${service.slug}`} replace />;
  return <ServiceDetailContent service={service} />;
}

function ServiceDetailContent({ service }) {
  const { t, i18n } = useTranslation();
  const p = (path, options) => t(`service_pages.${service.key}.${path}`, options);
  const c = (path, options) => t(`service_pages.common.${path}`, options);
  const url = `https://mandev.fr/fr/${service.slug}`;
  const idScript = `service-${service.key}-faq-jsonld`;

  usePageTitle(p("meta_title"));
  useReveal([i18n.language]);

  const steps = p("steps", { returnObjects: true });
  const points = p("points", { returnObjects: true });
  const timeline = i18n.exists(`service_pages.${service.key}.timeline`) ? p("timeline", { returnObjects: true }) : null;
  const prices = i18n.exists(`service_pages.${service.key}.prices`) ? p("prices", { returnObjects: true }) : null;
  const faq = p("faq", { returnObjects: true });

  // Prérendu : données structurées déposées dans le collecteur (les effets ne tournent pas côté serveur)
  if (import.meta.env.SSR) {
    if (Array.isArray(faq) && faq.length > 0) collecterJsonLd(idScript, faqJsonLd(faq));
    collecterJsonLd(`service-${service.key}-service-jsonld`, {
      "@context": "https://schema.org",
      "@type": "Service",
      name: p("meta_title"),
      serviceType: p("meta_title"),
      url,
      description: p("sub"),
      provider: { "@id": "https://mandev.fr/#service" },
      areaServed: [{ "@type": "City", name: "Toulouse" }, { "@type": "Country", name: "France" }],
    });
    collecterJsonLd(`service-${service.key}-breadcrumb-jsonld`, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ManDev Web", item: "https://mandev.fr/fr" },
        { "@type": "ListItem", position: 2, name: t("services_page.meta_title"), item: "https://mandev.fr/fr/services" },
        { "@type": "ListItem", position: 3, name: p("meta_title"), item: url },
      ],
    });
  }

  useEffect(() => {
    if (!Array.isArray(faq) || faq.length === 0) return;
    document.getElementById(idScript)?.remove(); // la page prérendue en contient déjà un
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = idScript;
    script.textContent = JSON.stringify(faqJsonLd(faq));
    document.head.appendChild(script);
    return () => script.remove();
  }, [faq, idScript]);

  if (!Array.isArray(steps) || !Array.isArray(points)) return null;

  return (
    <Layout hideFooterCta>
      {/* HERO : les étapes se cochent une par une à l'arrivée */}
      <section className="hero" aria-labelledby="service-title">
        <div className="container hero-grid svc-hero-grid">
          <div className="hero-main">
            <p className="eyebrow hero-eyebrow reveal">
              <span className="pulse" aria-hidden="true" /> {p("eyebrow")}
            </p>
            <h1 id="service-title" className="hero-title reveal" style={{ "--delay": "80ms" }}>
              {p("title_a")} <em>{p("title_em")}</em> {p("title_b")}
            </h1>
            <p className="hero-sub reveal" style={{ "--delay": "160ms" }}>{p("sub")}</p>
            <div className="hero-ctas reveal" style={{ "--delay": "240ms" }}>
              <Link to={{ pathname: "/fr", hash: "#devis" }} className="btn-primary">
                {c("cta")} <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/fr/contact" className="btn-outline">{c("cta_question")}</Link>
            </div>
            <p className="hero-offer reveal" style={{ "--delay": "280ms" }}>{p("hero_price")}</p>
            <div className="hero-call reveal" style={{ "--delay": "320ms" }}>
              <span className="hero-call-label">{t("home.call")}</span>
              <a className="hero-call-btn" href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
              <a className="hero-call-btn hero-call-btn--wa" href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>

          <aside className="svc-index" aria-label={p("aside_title")}>
            <p className="eyebrow svc-index-title">{p("aside_title")}</p>
            <ol>
              {steps.map((step, i) => (
                <li key={step.name} style={{ "--i": i }}>
                  <div className="svc-index-row">
                    <span className="svc-index-check" aria-hidden="true">✓</span>
                    <span className="svc-index-name">{step.name}</span>
                    <span className="svc-index-price">{step.short}</span>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* PRIX, juste sous le hero : trois niveaux pour la maintenance, une liste pour les autres */}
      {service.plans ? (
        <section className="block block--raised" aria-label={t("services_page.plans_title")}>
          <div className="container">
            <MaintenancePlans as="h2" />
          </div>
        </section>
      ) : (
        Array.isArray(prices) && (
          <section className="block block--raised metier-offer" aria-labelledby="service-prices-title">
            <div className="container">
              <header className="block-head reveal">
                <p className="eyebrow">{p("prices_eyebrow")}</p>
                <h2 id="service-prices-title" className="block-title">{p("prices_title")}</h2>
              </header>
              <div className={`svc-plans svc-plans--two${prices.length > 2 ? " svc-plans--many" : ""}`}>
                {prices.map((row, i) => (
                  <article key={row.name} className="svc-plan reveal" style={{ "--delay": `${i * 90}ms` }}>
                    <h3 className="svc-plan-name">{row.name}</h3>
                    <p className="svc-plan-price"><strong>{row.price}</strong> <span>{row.unit}</span></p>
                    <p className="svc-plan-tagline">{row.tagline}</p>
                    <ul className="metier-checks svc-plan-items">
                      {row.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    {row.demo_url && (
                      <a className="svc-more svc-plan-demo" href={row.demo_url} target="_blank" rel="noopener noreferrer">
                        {row.demo_label} <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
              <p className="metier-note svc-plans-note">{t("home.price_note", { article: vatArticle() })}</p>
            </div>
          </section>
        )
      )}

      {/* CE QUE VOUS OBTENEZ */}
      <section className="block metier-points" aria-labelledby="service-points-title">
        <div className="container">
          <header className="block-head reveal">
            <p className="eyebrow">{p("points_eyebrow")}</p>
            <h2 id="service-points-title" className="block-title">{p("points_title")}</h2>
          </header>
          <ul className="metier-grid">
            {points.map((point, i) => (
              <li key={point.name} className="metier-card reveal" style={{ "--delay": `${i * 70}ms` }}>
                <h3>{point.name}</h3>
                <p>{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMMENT ÇA SE PASSE */}
      <section className="block block--raised metier-offer" aria-labelledby="service-steps-title">
        <div className="container">
          <header className="block-head reveal">
            <p className="eyebrow">{c("steps_eyebrow")}</p>
            <h2 id="service-steps-title" className="block-title">{c("steps_title")}</h2>
          </header>
          <dl className="metier-offer-list">
            {steps.map((step, i) => (
              <div key={step.name} className="metier-offer-row reveal" style={{ "--delay": `${i * 70}ms` }}>
                <dt>{String(i + 1).padStart(2, "0")} · {step.name}</dt>
                <dd>{step.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* DÉLAIS RÉALISTES (référencement) */}
      {Array.isArray(timeline) && (
        <section className="block metier-offer" aria-labelledby="service-timeline-title">
          <div className="container">
            <header className="block-head reveal">
              <p className="eyebrow">{p("timeline_eyebrow")}</p>
              <h2 id="service-timeline-title" className="block-title">{p("timeline_title")}</h2>
            </header>
            <dl className="metier-offer-list">
              {timeline.map((row, i) => (
                <div key={row.when} className="metier-offer-row reveal" style={{ "--delay": `${i * 70}ms` }}>
                  <dt>{row.when}</dt>
                  <dd>{row.text}</dd>
                </div>
              ))}
            </dl>
            <p className="metier-note svc-plans-note reveal">{p("timeline_note")}</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      {Array.isArray(faq) && (
        <section className="block faq" aria-labelledby="service-faq-title">
          <div className="container faq-grid">
            <h2 id="service-faq-title" className="block-title reveal">{t("faq.title")}</h2>
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
      <section className="block metier-final" aria-labelledby="service-final-title">
        <div className="container metier-final-inner reveal">
          <h2 id="service-final-title" className="block-title">{p("final_title")}</h2>
          <p>{p("final_text")}</p>
          <div className="hero-ctas">
            <Link to="/fr/contact" className="btn-primary">
              {t("nav.contact")} <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/fr/services" className="btn-outline">{c("all_services")}</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
