import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Layout>
      <div className="projects-page">
        <div className="projects-page-header">
          <h1>Mes réalisations</h1>
          <p className="projects-intro">
            Des applications web complètes — de la base de données à l'interface, déployées en production.
          </p>
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
            {featured.map((p) => <ProjectCardHero key={p.id} project={p} />)}

            {rest.length > 0 && (
              <div className="projects-grid">
                {rest.map((p) => <ProjectCard key={p.id} project={p} />)}
              </div>
            )}

            {projects.length === 0 && (
              <p className="projects-empty">Les projets arrivent bientôt...</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ProjectCardHero({ project: p }) {
  return (
    <Link to={`/projets/${p.id}`} className="project-hero-card"
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
          <span className="hero-cta"><i className="fa-solid fa-arrow-right" aria-hidden="true" /> Voir le projet</span>
        </div>
      </div>
    </Link>
  );
}

function ProjectCard({ project: p, featured }) {
  return (
    <Link to={`/projets/${p.id}`} className={`project-card ${featured ? "featured" : ""}`}>
      <div className="project-img">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.title} />
        ) : (
          <div className="project-img-placeholder">
            <i className="fa-solid fa-code" aria-hidden="true" />
          </div>
        )}
        <div className="card-hover-overlay">
          <span><i className="fa-solid fa-arrow-right" aria-hidden="true" /> Voir le projet</span>
        </div>
      </div>
      <div className="project-body">
        <h3>{p.title}</h3>
        <p>{p.description}</p>
        {p.stack?.length > 0 && (
          <div className="project-stack">
            {p.stack.map((t, i) => <span key={i} className="stack-tag">{t}</span>)}
          </div>
        )}
        <div className="project-links">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-live" onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Voir le site
            </a>
          )}
          <span className="btn-link btn-link-detail">
            <i className="fa-solid fa-circle-info" aria-hidden="true" /> Détails
          </span>
        </div>
      </div>
    </Link>
  );
}
