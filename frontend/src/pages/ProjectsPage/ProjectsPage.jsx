import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const lp = (path) => `/${lang}${path}`;

  useEffect(() => {
    apiFetch(`/api/projects?lang=${lang}`)
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Layout>
      <div className="projects-page">
        <div className="projects-page-header">
          <h1>{t("projects.title")}</h1>
          <p className="projects-intro">{t("projects.intro")}</p>
        </div>

        {loading ? (
          <div className="projects-page-body">
            <div className="skeleton-hero" />
            <div className="projects-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        ) : (
          <div className="projects-page-body">
            {featured.map((p) => <ProjectCardHero key={p.id} project={p} lp={lp} t={t} />)}

            {rest.length > 0 && (
              <div className="projects-grid">
                {rest.map((p) => <ProjectCard key={p.id} project={p} lp={lp} t={t} />)}
              </div>
            )}

            {projects.length === 0 && (
              <p className="projects-empty">{t("projects.empty")}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ProjectCardHero({ project: p, lp, t }) {
  return (
    <Link to={lp(`/projets/${p.id}`)} className="project-hero-card"
      style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})` } : {}}>
      <div className="project-hero-overlay" />
      <div className="project-hero-content">
        <div className="project-hero-top">
          {p.stack?.length > 0 && (
            <div className="project-hero-stack">
              {p.stack.slice(0, 5).map((t, i) => <span key={i} className="hero-stack-tag">{t}</span>)}
            </div>
          )}
        </div>
        <div className="project-hero-bottom">
          <h2>{p.title}</h2>
          <p>{p.description}</p>
          <span className="hero-cta"><i className="fa-solid fa-arrow-right" aria-hidden="true" /> {t("projects.see_project")}</span>
        </div>
      </div>
    </Link>
  );
}

function ProjectCard({ project: p, lp, t }) {
  return (
    <Link to={lp(`/projets/${p.id}`)} className="project-card">
      <div className="project-img">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.title} />
        ) : (
          <div className="project-img-placeholder">
            <i className="fa-solid fa-code" aria-hidden="true" />
          </div>
        )}
        <div className="card-hover-overlay">
          <span><i className="fa-solid fa-arrow-right" aria-hidden="true" /> {t("projects.see_project")}</span>
        </div>
      </div>
      <div className="project-body">
        <h3>{p.title}</h3>
        <p>{p.description}</p>
        {p.stack?.length > 0 && (
          <div className="project-stack">
            {p.stack.map((tag, i) => <span key={i} className="stack-tag">{tag}</span>)}
          </div>
        )}
        <div className="project-links">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-live" onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> {t("projects.see_site")}
            </a>
          )}
          <span className="btn-link btn-link-detail">
            <i className="fa-solid fa-circle-info" aria-hidden="true" /> {t("projects.details")}
          </span>
        </div>
      </div>
    </Link>
  );
}
