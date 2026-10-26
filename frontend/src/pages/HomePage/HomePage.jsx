import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import useReveal from "../../utils/useReveal";
import usePageTitle from "../../utils/usePageTitle";
import QuickQuote from "../../components/QuickQuote/QuickQuote";
import Faq from "../../components/Faq/Faq";
import Reviews from "../../components/Reviews/Reviews";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import "./HomePage.css";

const pad = (n) => String(n + 1).padStart(2, "0");

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const { hash } = useLocation();
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
    if (el) el.scrollIntoView();
  }, [hash]);

  const facts = t("home.facts", { returnObjects: true });
  const services = t("home.services", { returnObjects: true });
  const steps = t("home.steps", { returnObjects: true });

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
              <Link to={lp("/projets")} className="btn-outline">{t("home.cta_work")}</Link>
            </div>
            <p className="hero-offer reveal" style={{ "--delay": "280ms" }}>{t("home.offer")}</p>
            <p className="hero-call reveal" style={{ "--delay": "320ms" }}>
              {t("home.call")}{" "}
              <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
              {" · "}
              <a href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </p>
          </div>

          {projects[0] && projects[0].imageUrl && (
            <Link to={lp(`/projets/${projects[0].id}`)} className="hero-proof reveal" style={{ "--delay": "240ms" }}>
              <img src={projects[0].imageUrl} alt="" />
              <span className="hero-proof-title">{projects[0].title}</span>
            </Link>
          )}

          <dl className="hero-facts reveal" style={{ "--delay": "320ms" }}>
            {Array.isArray(facts) && facts.map((f) => (
              <div key={f.label} className="fact">
                <dt className="eyebrow">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* BANDEAU */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k} className="marquee-set">
              {t("home.marquee").split("·").map((w, i) => (
                <span key={`${k}-${i}`}>{w.trim()}<i>✺</i></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* MAQUETTE GRATUITE */}
      <QuickQuote />

      {/* SERVICES */}
      <section id="services" className="block">
        <div className="container">
          <header className="block-head reveal">
            <p className="eyebrow">{t("home.services_eyebrow")}</p>
            <h2 className="block-title">{t("home.services_title")}</h2>
          </header>

          <div className="services">
            {Array.isArray(services) && services.map((s, i) => (
              <article key={s.name} className="service reveal" style={{ "--delay": `${i * 90}ms` }}>
                <p className="service-tag">{s.tag}</p>
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
                  <Link to={{ pathname: lp(""), hash: "#devis" }} className="service-link">
                    {t("home.services_cta")} <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <Link to={lp("/contact")} className="service-link">
                    {t("home.services_cta_contact")} <span aria-hidden="true">↗</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
          <p className="services-note">{t("home.price_note")}</p>
        </div>
      </section>

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

      {/* PROCESS */}
      <section id="process" className="block">
        <div className="container">
          <header className="block-head reveal">
            <p className="eyebrow">{t("home.process_eyebrow")}</p>
            <h2 className="block-title">{t("home.process_title")}</h2>
          </header>

          <ol className="steps">
            {Array.isArray(steps) && steps.map((s, i) => (
              <li key={s.title} className="step reveal" style={{ "--delay": `${i * 90}ms` }}>
                <span className="step-num">{pad(i)}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

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
