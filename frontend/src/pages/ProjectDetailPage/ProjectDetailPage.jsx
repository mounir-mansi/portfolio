import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ProjectDetailPage.css";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/projects/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setProject)
      .catch(() => navigate("/projets", { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="detail-loading">Chargement...</div>
      </Layout>
    );
  }

  if (!project) return null;

  return (
    <Layout>
      <div className="detail-page">

        {/* Header */}
        <div className="detail-header">
          <Link to="/projets" className="detail-back">
            <i className="fa-solid fa-arrow-left" /> Tous les projets
          </Link>
          <div className="detail-header-content">
            {project.featured && (
              <span className="detail-featured-badge">
                <i className="fa-solid fa-star" /> Mis en avant
              </span>
            )}
            <h1>{project.title}</h1>
            <p className="detail-description">{project.description}</p>
            <div className="detail-ctas">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-btn-primary">
                  <i className="fa-solid fa-arrow-up-right-from-square" /> Voir le site
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
                  <h2><i className="fa-solid fa-file-lines" /> À propos du projet</h2>
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
                  <h2><i className="fa-solid fa-list-check" /> Points clés</h2>
                  <ul className="detail-highlights">
                    {project.highlights.map((h, i) => (
                      <li key={i}>
                        <i className="fa-solid fa-check" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Message si pas de détails encore */}
              {!project.longDescription && !project.highlights?.length && (
                <div className="detail-section detail-placeholder">
                  <i className="fa-solid fa-pen-to-square" />
                  <p>La description détaillée de ce projet sera ajoutée prochainement depuis le panneau admin.</p>
                </div>
              )}

            </div>

            <div className="detail-right">

              {/* Stack */}
              {project.stack?.length > 0 && (
                <div className="detail-card">
                  <h3><i className="fa-solid fa-layer-group" /> Stack technique</h3>
                  <div className="detail-stack">
                    {project.stack.map((t, i) => (
                      <span key={i} className="stack-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Liens */}
              <div className="detail-card">
                <h3><i className="fa-solid fa-link" /> Liens</h3>
                <div className="detail-links-list">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-link-item">
                      <i className="fa-solid fa-globe" />
                      <div>
                        <strong>Site en ligne</strong>
                        <span>{project.liveUrl}</span>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square detail-link-arrow" />
                    </a>
                  ) : (
                    <div className="detail-link-item detail-link-empty">
                      <i className="fa-solid fa-globe" />
                      <div><strong>Site en ligne</strong><span>Non disponible</span></div>
                    </div>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="detail-link-item">
                      <i className="fa-brands fa-github" />
                      <div>
                        <strong>Code source</strong>
                        <span>GitHub</span>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square detail-link-arrow" />
                    </a>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="detail-card">
                <h3><i className="fa-solid fa-calendar" /> Date</h3>
                <p className="detail-date">
                  {new Date(project.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                </p>
              </div>

            </div>
          </div>

          {/* Navigation bas de page */}
          <div className="detail-footer-nav">
            <Link to="/projets" className="detail-btn-outline">
              <i className="fa-solid fa-arrow-left" /> Retour aux projets
            </Link>
            <Link to="/contact" className="detail-btn-primary">
              <i className="fa-solid fa-envelope" /> Me contacter
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
