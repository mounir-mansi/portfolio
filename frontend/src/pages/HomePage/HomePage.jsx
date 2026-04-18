import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./HomePage.css";

export default function HomePage() {
  const [section, setSection] = useState(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const lp = (path) => `/${lang}${path}`;

  useEffect(() => {
    apiFetch(`/api/sections?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setSection(d.hero || null))
      .catch(() => {});
  }, [lang]);

  const bg = section?.imageUrl || null;

  return (
    <Layout>
      <section
        className="home-hero"
        aria-labelledby="hero-title"
        style={bg ? { backgroundImage: `url(${bg})` } : {}}
      >
        <div className="home-overlay" />
        <div className="home-hero-inner">
          <div className="home-content">
            <p className="home-greeting">{t("home.greeting")}</p>
            <h1 className="home-title" id="hero-title">Mounir</h1>
            <div className="home-badges">
              <span className="home-badge"><i className="fa-solid fa-code" aria-hidden="true" /> {t("home.badge_dev")}</span>
              <span className="home-badge home-badge-accent"><i className="fa-solid fa-briefcase" aria-hidden="true" /> {t("home.badge_freelance")}</span>
            </div>
            <p className="home-subtitle">{t("home.subtitle")}</p>
            <p className="home-desc">{t("home.desc")}</p>
            <div className="home-ctas">
              <Link to={lp("/projets")} className="btn-primary">{t("home.see_projects")}</Link>
              <Link to={lp("/contact")} className="btn-outline">{t("home.contact")}</Link>
              <a
                href="https://github.com/mounir-mansi"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <i className="fa-brands fa-github" aria-hidden="true" /> GitHub
              </a>
            </div>
          </div>
          <div className="home-logo-side">
            <img src="/logo-transparent.png" alt="ManDev Web" className="home-logo-img" width="520" height="520" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
