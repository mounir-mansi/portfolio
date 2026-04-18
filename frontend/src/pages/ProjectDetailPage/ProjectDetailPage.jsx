import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ProjectDetailPage.css";

const LOCALE_MAP = { fr: "fr-FR", en: "en-GB", it: "it-IT", es: "es-ES" };

export default function ProjectDetailPage() {
  const { id, lang = "fr" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const lp = (path) => `/${lang}${path}`;

  useEffect(() => {
    apiFetch(`/api/projects/${id}?lang=${lang}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setProject)
      .catch(() => navigate(lp("/projets"), { replace: true }))
      .finally(() => setLoading(false));
  }, [id, lang]);

  if (loading) {
    return (
      <Layout>
        <div className="detail-loading">{t("detail.loading")}</div>
      </Layout>
    );
  }

  if (!project) return null;

  const locale = LOCALE_MAP[lang] || "fr-FR";

  return (
    <Layout>
      <div className="detail-page">

        {/* Header */}
        <div className="detail-header">
          <Link to={lp("/projets")} className="detail-back">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("detail.all_projects")}
          </Link>
          <div className="detail-header-content">
            {project.featured && (
              <span className="detail-featured-badge">
                <i className="fa-solid fa-star" aria-hidden="true" /> {t("detail.featured")}
              </span>
            )}
            <h1>{project.title}</h1>
            <p className="detail-description">{project.description}</p>
            <div className="detail-ctas">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-btn-primary">
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> {t("detail.live_site")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="detail-body">

          {/* Image principale */}
          {project.imageUrl && (
            <div className="detail-image-wrap">
              <img src={project.imageUrl} alt={project.title} className="detail-image" />
            </div>
          )}

          <div className="detail-main">
            <div className="detail-left">

              {/* Description longue */}
              {project.longDescription && (
                <div className="detail-section">
                  <h2><i className="fa-solid fa-file-lines" aria-hidden="true" /> {t("detail.about_project")}</h2>
                  <div className="detail-long-desc">
                    {project.longDescription.split("\n").map((line, i) =>
                      line.trim() ? <p key={i}>{line}</p> : null
                    )}
                  </div>
                </div>
              )}

              {/* Points clés */}
              {project.highlights?.length > 0 && (
                <div className="detail-section">
                  <h2><i className="fa-solid fa-list-check" aria-hidden="true" /> {t("detail.key_points")}</h2>
                  <ul className="detail-highlights">
                    {project.highlights.map((h, i) => (
                      <li key={i}>
                        <i className="fa-solid fa-check" aria-hidden="true" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Message si pas de détails encore */}
              {!project.longDescription && !project.highlights?.length && (
                <div className="detail-section detail-placeholder">
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                  <p>{t("detail.placeholder")}</p>
                </div>
              )}

            </div>

            <div className="detail-right">

              {/* Stack */}
              {project.stack?.length > 0 && (
                <div className="detail-card">
                  <h3><i className="fa-solid fa-layer-group" aria-hidden="true" /> {t("detail.stack")}</h3>
                  <div className="detail-stack">
                    {project.stack.map((tag, i) => (
                      <span key={i} className="stack-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Liens */}
              <div className="detail-card">
                <h3><i className="fa-solid fa-link" aria-hidden="true" /> {t("detail.links")}</h3>
                <div className="detail-links-list">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-link-item">
                      <i className="fa-solid fa-globe" aria-hidden="true" />
                      <div>
                        <strong>{t("detail.live_site")}</strong>
                        <span>{project.liveUrl}</span>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square detail-link-arrow" aria-hidden="true" />
                    </a>
                  ) : (
                    <div className="detail-link-item detail-link-empty">
                      <i className="fa-solid fa-globe" aria-hidden="true" />
                      <div><strong>{t("detail.live_site")}</strong><span>{t("detail.not_available")}</span></div>
                    </div>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="detail-link-item">
                      <i className="fa-brands fa-github" aria-hidden="true" />
                      <div>
                        <strong>{t("detail.source_code")}</strong>
                        <span>GitHub</span>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square detail-link-arrow" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="detail-card">
                <h3><i className="fa-solid fa-calendar" aria-hidden="true" /> {t("detail.date")}</h3>
                <p className="detail-date">
                  {new Date(project.createdAt).toLocaleDateString(locale, { year: "numeric", month: "long" })}
                </p>
              </div>

            </div>
          </div>

          {/* Navigation bas de page */}
          <div className="detail-footer-nav">
            <Link to={lp("/projets")} className="detail-btn-outline">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t("detail.back")}
            </Link>
            <Link to={lp("/contact")} className="detail-btn-primary">
              <i className="fa-solid fa-envelope" aria-hidden="true" /> {t("detail.contact")}
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
