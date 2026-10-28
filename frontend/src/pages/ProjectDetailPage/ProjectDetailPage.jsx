import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import usePageTitle from "../../utils/usePageTitle";
import "./ProjectDetailPage.css";

const LOCALE_MAP = { fr: "fr-FR", en: "en-GB", it: "it-IT", es: "es-ES" };

export default function ProjectDetailPage() {
  const { id, lang = "fr" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const lp = (path) => `/${lang}${path}`;
  usePageTitle(project?.title);

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
        <div className="detail-loading" role="status">{t("detail.loading")}</div>
      </Layout>
    );
  }

  if (!project) return null;

  const locale = LOCALE_MAP[lang] || "fr-FR";
  const hasText = project.longDescription || project.highlights?.length > 0;

  return (
    <Layout>
      <header className="page-head container detail-head">
        <Link to={lp("/projets")} className="detail-back">{t("detail.all_projects")}</Link>
        <h1 className="page-title">{project.title}</h1>
        <p className="page-intro">{project.description}</p>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary detail-live">
            {t("detail.live_site")}
          </a>
        )}
      </header>

      <div className="page-body container detail-body">
        {project.imageUrl && (
          <img src={project.imageUrl} alt={project.title} className="detail-image" />
        )}

        <div className="detail-main">
          <div className="detail-text">
            {project.longDescription && (
              <section>
                <h2 className="detail-section-title">{t("detail.about_project")}</h2>
                <div className="detail-long-desc">
                  {project.longDescription.split("\n").map((line, i) =>
                    line.trim() ? <p key={i}>{line}</p> : null
                  )}
                </div>
              </section>
            )}

            {project.highlights?.length > 0 && (
              <section>
                <h2 className="detail-section-title">{t("detail.key_points")}</h2>
                <ul className="detail-highlights">
                  {project.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </section>
            )}

            {!hasText && <p className="detail-placeholder">{t("detail.placeholder")}</p>}
          </div>

          <dl className="detail-facts">
            {project.stack?.length > 0 && (
              <div>
                <dt>{t("detail.stack")}</dt>
                <dd>
                  <ul className="detail-stack">
                    {project.stack.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </dd>
              </div>
            )}
            {project.githubUrl && (
              <div>
                <dt>{t("detail.source_code")}</dt>
                <dd>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="detail-ext">
                    GitHub
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>{t("detail.date")}</dt>
              <dd>{new Date(project.createdAt).toLocaleDateString(locale, { year: "numeric", month: "long" })}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-footer-nav">
          <Link to={lp("/projets")} className="btn-outline">{t("detail.back")}</Link>
          <Link to={lp("/contact")} className="btn-primary">{t("detail.contact")}</Link>
        </div>
      </div>
    </Layout>
  );
}
