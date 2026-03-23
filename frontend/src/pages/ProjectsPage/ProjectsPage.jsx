import { useEffect, useState } from "react";
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
          <p className="section-tag">Projets</p>
          <h1>Mes réalisations</h1>
          <p className="projects-intro">
            Des projets fullstack conçus et déployés de A à Z — du backend sécurisé à l'interface utilisateur.
          </p>
        </div>

        {loading ? (
          <p className="projects-loading">Chargement...</p>
        ) : (
          <div className="projects-page-body">
            {featured.length > 0 && (
              <>
                <h2 className="projects-section-title">
                  <i className="fa-solid fa-star" /> Mis en avant
                </h2>
                <div className="projects-featured-grid">
                  {featured.map((p) => <ProjectCard key={p.id} project={p} featured />)}
                </div>
              </>
            )}

            {rest.length > 0 && (
              <>
                <h2 className="projects-section-title">Autres projets</h2>
                <div className="projects-grid">
                  {rest.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </>
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

function ProjectCard({ project: p, featured }) {
  return (
    <article className={`project-card ${featured ? "featured" : ""}`}>
      <div className="project-img">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.title} />
        ) : (
          <div className="project-img-placeholder">
            <i className="fa-solid fa-code" />
          </div>
        )}
        {featured && <span className="featured-badge"><i className="fa-solid fa-star" /> Mis en avant</span>}
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
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
              <i className="fa-solid fa-arrow-up-right-from-square" /> Voir le site
            </a>
          )}
          {p.githubUrl && (
            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-ghost">
              <i className="fa-brands fa-github" /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
