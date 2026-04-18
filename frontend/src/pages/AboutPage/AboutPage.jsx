import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./AboutPage.css";

export default function AboutPage() {
  const [section, setSection] = useState(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const lp = (path) => `/${lang}${path}`;

  useEffect(() => {
    apiFetch(`/api/sections?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setSection(d.about || null))
      .catch(() => {});
  }, [lang]);

  const text = section?.text || null;

  return (
    <Layout>
      <div className="about-page">
        <div className="about-page-inner">
          <div className="about-left">
            <h1>{t("about.title1")}<br />{t("about.title2")}</h1>

            <div className="about-page-body">
              {text ? (
                <p>{text}</p>
              ) : (
                <>
                  <p>{t("about.p1")}</p>
                  <p>{t("about.p2")}</p>
                </>
              )}
            </div>

            <div className="about-badges">
              <span className="badge">React</span>
              <span className="badge">Next.js</span>
              <span className="badge">TypeScript</span>
              <span className="badge">Node.js</span>
              <span className="badge">Express</span>
              <span className="badge">PostgreSQL</span>
              <span className="badge">MySQL</span>
              <span className="badge">Prisma</span>
              <span className="badge">Linux / VPS</span>
              <span className="badge">Nginx</span>
              <span className="badge">Cloudflare</span>
              <span className="badge">Git</span>
              <span className="badge">Vite</span>
              <span className="badge">REST API</span>
              <span className="badge">Tailwind</span>
              <span className="badge">JWT</span>
              <span className="badge">PM2</span>
            </div>

            <div className="about-ctas">
              <Link to={lp("/projets")} className="btn-about-primary">{t("about.see_projects")}</Link>
              <Link to={lp("/contact")} className="btn-about-outline">{t("about.contact")}</Link>
            </div>

            {/* Parcours */}
            <div className="about-timeline">
              <h2 className="timeline-title"><i className="fa-solid fa-route" aria-hidden="true" /> {t("about.timeline_title")}</h2>
              <div className="timeline">

                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-label">{t("about.simplon_title")}</span>
                    <p>{t("about.simplon_text")}</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot timeline-dot-sm" />
                  <div className="timeline-content">
                    <span className="timeline-label">{t("about.python_title")}</span>
                    <p>{t("about.python_text")}</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-label">{t("about.wcs_title")}</span>
                    <p>{t("about.wcs_text")}</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot timeline-dot-accent" />
                  <div className="timeline-content">
                    <span className="timeline-label">{t("about.self_title")}</span>
                    <p>{t("about.self_text")}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="about-values">
          <div className="value-card">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            <h3>{t("about.val_security")}</h3>
            <p>{t("about.val_security_desc")}</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-bolt" aria-hidden="true" />
            <h3>{t("about.val_perf")}</h3>
            <p>{t("about.val_perf_desc")}</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-mobile-screen" aria-hidden="true" />
            <h3>{t("about.val_responsive")}</h3>
            <p>{t("about.val_responsive_desc")}</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-rocket" aria-hidden="true" />
            <h3>{t("about.val_deploy")}</h3>
            <p>{t("about.val_deploy_desc")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
