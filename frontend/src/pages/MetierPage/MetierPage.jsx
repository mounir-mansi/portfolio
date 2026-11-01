import { useEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import HeroQuote from "../../components/HeroQuote/HeroQuote";
import QuoteSection from "../../components/QuickQuote/QuoteSection";
import useReveal from "../../utils/useReveal";
import usePageTitle from "../../utils/usePageTitle";
import { collecterJsonLd, faqJsonLd } from "../../utils/ssrHead";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import "./MetierPage.css";

// Page « Site internet pour [métier] » : même hero et même formulaire que l'accueil, avec des textes propres au métier.
// Les textes existent seulement en français : les autres langues renvoient vers la version française.
export default function MetierPage({ metier }) {
  const { lang = "fr" } = useParams();
  if (lang !== "fr") return <Navigate to={`/fr/${metier.slug}`} replace />;
  return <MetierContent metier={metier} />;
}

function MetierContent({ metier }) {
  const { t, i18n } = useTranslation();
  const { hash, key } = useLocation();
  const m = (path, options) => t(`metiers.${metier.key}.${path}`, options);
  const c = (path, options) => t(`metiers.common.${path}`, options);
  // Un métier peut avoir sa propre version d'un texte commun (ex. l'offre) ; sinon on prend celle du bloc commun
  const pick = (path, options) => (i18n.exists(`metiers.${metier.key}.${path}`) ? m(path, options) : c(path, options));

  usePageTitle(m("meta_title"));
  useReveal([i18n.language]);

  // Le lien #devis mène au formulaire du hero sur grand écran (la section du dessous n'apparaît qu'après l'envoi)
  useEffect(() => {
    if (hash !== "#devis") return;
    const section = document.getElementById("devis");
    if (section && section.getClientRects().length > 0) {
      section.scrollIntoView();
    } else {
      // Grand écran : le formulaire est dans le hero. Mobile : #devis ouvre la modale, la page ne bouge pas.
      const first = document.getElementById("hero-quote-name");
      if (first && first.getClientRects().length > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        first.focus({ preventScroll: true });
      }
    }
  }, [hash, key]);

  const points = m("points", { returnObjects: true });
  const faq = m("faq", { returnObjects: true });
  const offer = pick("offer", { returnObjects: true });
  const demoPoints = m("demo_points", { returnObjects: true });

  // Prérendu : données structurées FAQ déposées dans le collecteur (les effets ne tournent pas côté serveur)
  if (import.meta.env.SSR && Array.isArray(faq) && faq.length > 0) collecterJsonLd("metier-faq-jsonld", faqJsonLd(faq));

  if (import.meta.env.SSR) {
    const url = `https://mandev.fr/fr/${metier.slug}`;
    collecterJsonLd("metier-service-jsonld", {
        "@context": "https://schema.org",
        "@type": "Service",
        name: m("meta_title"),
        serviceType: "Création de site internet",
        url,
        description: m("sub"),
        provider: { "@id": "https://mandev.fr/#service" },
        areaServed: [{ "@type": "City", name: "Toulouse" }, { "@type": "Country", name: "France" }],
      });
    collecterJsonLd("metier-breadcrumb-jsonld", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ManDev Web", item: "https://mandev.fr/fr" },
          { "@type": "ListItem", position: 2, name: m("meta_title"), item: url },
        ],
      });
  }

  // Données structurées FAQ pour Google
  useEffect(() => {
    if (!Array.isArray(faq) || faq.length === 0) return;
    document.getElementById("metier-faq-jsonld")?.remove(); // la page prérendue en contient déjà un
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "metier-faq-jsonld";
    script.textContent = JSON.stringify(faqJsonLd(faq));
    document.head.appendChild(script);
    return () => script.remove();
  }, [faq]);

  return (
    <Layout hideFooterCta>
      {/* HERO : mêmes composants que l'accueil */}
      <section className="hero" aria-labelledby="metier-title">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="eyebrow hero-eyebrow reveal">
              <span className="pulse" aria-hidden="true" /> {m("eyebrow")}
            </p>
            <h1 id="metier-title" className="hero-title reveal" style={{ "--delay": "80ms" }}>
              {m("title_a")} <em>{m("title_em")}</em> {m("title_b")}
            </h1>
            <p className="hero-sub reveal" style={{ "--delay": "160ms" }}>{m("sub")}</p>
            <div className="hero-ctas reveal" style={{ "--delay": "240ms" }}>
              <Link to={{ pathname: `/fr/${metier.slug}`, hash: "#devis" }} className="btn-primary">
                {m("cta")} <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="hero-offer reveal" style={{ "--delay": "280ms" }}>{t("home.offer")}</p>
            <div className="hero-call reveal" style={{ "--delay": "320ms" }}>
              <span className="hero-call-label">{t("home.call")}</span>
              <a className="hero-call-btn" href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
              <a className="hero-call-btn hero-call-btn--wa" href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          <HeroQuote />
        </div>
      </section>

      {/* CE QUE LES CLIENTS CHERCHENT */}
      {Array.isArray(points) && (
        <section className="block metier-points" aria-labelledby="metier-points-title">
          <div className="container">
            <header className="block-head reveal">
              <p className="eyebrow">{m("points_eyebrow")}</p>
              <h2 id="metier-points-title" className="block-title">{m("points_title")}</h2>
            </header>
            <ul className="metier-grid">
              {points.map((p, i) => (
                <li key={p.name} className="metier-card reveal" style={{ "--delay": `${i * 70}ms` }}>
                  <h3>{p.name}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* SITE DE DÉMONSTRATION */}
      <section className="block block--raised metier-demo" aria-labelledby="metier-demo-title">
        <div className="container metier-demo-grid">
          <div className="metier-demo-text reveal">
            <p className="eyebrow">{m("demo_eyebrow")}</p>
            <h2 id="metier-demo-title" className="block-title">{m("demo_title")}</h2>
            <p>{m("demo_text", { name: metier.demo.name })}</p>
            {Array.isArray(demoPoints) && (
              <ul className="metier-checks">
                {demoPoints.map((p) => <li key={p}>{p}</li>)}
              </ul>
            )}
            <a className="btn-outline" href={metier.demo.url} target="_blank" rel="noopener noreferrer">
              {c("demo_link")} <span aria-hidden="true">↗</span>
            </a>
            <p className="metier-note">{pick("demo_note")}</p>
          </div>
          <a className="metier-demo-shot reveal" style={{ "--delay": "120ms" }} href={metier.demo.url} target="_blank" rel="noopener noreferrer" aria-label={`${metier.demo.name} — ${c("demo_link")}`}>
            <img src={metier.demo.image} alt="" loading="lazy" width="1600" height="790" />
          </a>
        </div>
      </section>

      {/* CE QUE VOUS RECEVEZ */}
      {Array.isArray(offer) && (
        <section className="block metier-offer" aria-labelledby="metier-offer-title">
          <div className="container">
            <header className="block-head reveal">
              <h2 id="metier-offer-title" className="block-title">{c("offer_title")}</h2>
            </header>
            <dl className="metier-offer-list">
              {offer.map((row, i) => (
                <div key={row.name} className="metier-offer-row reveal" style={{ "--delay": `${i * 70}ms` }}>
                  <dt>{row.name}</dt>
                  <dd>{row.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* FAQ DU MÉTIER */}
      {Array.isArray(faq) && (
        <section className="block faq" aria-labelledby="metier-faq-title">
          <div className="container faq-grid">
            <h2 id="metier-faq-title" className="block-title reveal">{t("faq.title")}</h2>
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
      <section className="block metier-final" aria-labelledby="metier-final-title">
        <div className="container metier-final-inner reveal">
          <h2 id="metier-final-title" className="block-title">{m("final_title")}</h2>
          <p>{m("final_text")}</p>
          <Link to={{ pathname: `/fr/${metier.slug}`, hash: "#devis" }} className="btn-primary">
            {t("home.cta_quote")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {/* Formulaire complet (étapes 2 à 5) : visible après l'envoi du formulaire du hero, ou directement sur mobile */}
      <QuoteSection />
    </Layout>
  );
}
