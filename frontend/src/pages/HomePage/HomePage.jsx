import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import useReveal from "../../utils/useReveal";
import usePageTitle from "../../utils/usePageTitle";
import QuoteSection from "../../components/QuickQuote/QuoteSection";
import HeroQuote from "../../components/HeroQuote/HeroQuote";
import Faq from "../../components/Faq/Faq";
import Reviews from "../../components/Reviews/Reviews";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import { vatArticle } from "../../data/legal";
import "./HomePage.css";


export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const { hash, key } = useLocation();
  const lp = (path) => `/${lang}${path}`;

  useEffect(() => {
    apiFetch(`/api/projects?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {})
      .finally(() => setProjectsLoaded(true));
  }, [lang]);

  usePageTitle(t("meta.home"), { full: true });
  useReveal([projects.length, lang]);

  // Défilement vers l'ancre (#services) après navigation depuis une autre page
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el && el.getClientRects().length > 0) {
      el.scrollIntoView();
    } else if (hash === "#devis") {
      // Grand écran : le formulaire est dans le hero, la section #devis n'apparaît qu'après l'envoi.
      // Mobile : #devis ouvre la modale, la page ne bouge pas.
      const first = document.getElementById("hero-quote-name");
      if (first && first.getClientRects().length > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        first.focus({ preventScroll: true });
      }
    }
    // `key` change à chaque clic sur un lien, même vers la même ancre : le défilement se refait
  }, [hash, key]);

  const services = t("home.services", { returnObjects: true });

  return (
    <Layout>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-main">
            <p className="eyebrow hero-eyebrow reveal">
              <span className="pulse" aria-hidden="true" /> {t("home.eyebrow")}
            </p>
            <h1 id="hero-title" className="hero-title reveal" style={{ "--delay": "80ms" }}>
              {t("home.title_a")} <em>{t("home.title_em")}</em> {t("home.title_b")}
            </h1>
            <p className="hero-sub reveal" style={{ "--delay": "160ms" }}>{t("home.sub")}</p>
            <div className="hero-ctas reveal" style={{ "--delay": "240ms" }}>
              <Link to={{ pathname: lp(""), hash: "#devis" }} className="btn-primary">
                {t("home.cta_quote")} <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="hero-offer reveal" style={{ "--delay": "280ms" }}>{t("home.offer")}</p>
            <div className="hero-call reveal" style={{ "--delay": "320ms" }}>
              <span className="hero-call-label">{t("home.call")}</span>
              {/* Icônes téléphone et WhatsApp — Font Awesome Free 6.4.0 (CC BY 4.0), en SVG */}
              <a className="hero-call-btn" href={`tel:${CONTACT_PHONE_HREF}`}>
                <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
                  <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" />
                </svg>
                {CONTACT_PHONE_DISPLAY}
              </a>
              <a className="hero-call-btn hero-call-btn--wa" href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          <HeroQuote />
        </div>
      </section>

      {/* MAQUETTE GRATUITE */}
      <QuoteSection />

      {/* SERVICES */}
      <section id="services" className="block">
        <div className="container">
          <header className="block-head reveal">
            <p className="eyebrow">{t("home.services_eyebrow")}</p>
            <h2 className="block-title">{t("home.services_title")}</h2>
          </header>

          <div className="services">
            {Array.isArray(services) && services.map((s, i) => (
              <article key={s.name} className={`service reveal ${i === 1 ? "service--featured" : ""}`} style={{ "--delay": `${i * 90}ms` }}>
                {i === 1 && <span className="service-badge">{t("home.popular")}</span>}
                <h3 className="service-name">{s.name}</h3>
                <p className="service-price">
                  {s.price_prefix && <span className="service-price-prefix">{s.price_prefix}</span>}
                  <strong>{s.price}</strong>
                </p>
                <p className="service-desc">{s.desc}</p>
                <ul className="service-list">
                  {s.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
                {i < 2 ? (
                  <Link to={{ pathname: lp(""), hash: "#devis" }} className={`service-link ${i === 1 ? "btn-primary" : "btn-outline"}`}>
                    {t("home.services_cta")} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <Link to={lp("/contact")} className="service-link btn-outline">
                    {t("home.services_cta_contact")} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
          <p className="services-note">{t("home.price_note", { article: vatArticle() })}</p>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* RÉALISATIONS */}
      {!projectsLoaded && (
        <section className="block block--raised" aria-hidden="true">
          <div className="container work-skeleton">
            <span /><span /><span />
          </div>
        </section>
      )}
      {projects.length > 0 && (
        <section id="work" className="block block--raised">
          <div className="container">
            <header className="block-head block-head--row reveal">
              <div>
                <p className="eyebrow">{t("home.work_eyebrow")}</p>
                <h2 className="block-title">{t("home.work_title")}</h2>
              </div>
              <Link to={lp("/projets")} className="btn-outline">{t("home.work_all")}</Link>
            </header>

            <ul className="work">
              {projects.map((p, i) => (
                <li key={p.id} className="work-item reveal" style={{ "--delay": `${i * 90}ms` }}>
                  <Link to={lp(`/projets/${p.id}`)} className="work-link">
                    <span className="work-body">
                      <span className="work-title">{p.title}</span>
                      <span className="work-desc">{p.description}</span>
                    </span>
                    <span className="work-stack">
                      {(p.stack || []).slice(0, 3).join(" · ")}
                    </span>
                    {p.imageUrl && (
                      <span className="work-thumb">
                        <img src={p.imageUrl} alt="" loading="lazy" />
                      </span>
                    )}
                    <span className="work-arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* AVIS (invisible tant que src/data/reviews.js est vide) */}
      <Reviews />

      {/* APPEL FINAL */}
      <section className="block final">
        <div className="container final-inner reveal">
          <p className="eyebrow">{t("home.final_eyebrow")}</p>
          <h2 className="final-title">{t("home.final_title")}</h2>
          <Link to={{ pathname: lp(""), hash: "#devis" }} className="btn-primary">
            {t("home.cta_quote")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
