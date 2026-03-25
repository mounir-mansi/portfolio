import "./Projects.css";

export default function Projects({ projects }) {
  if (projects.length === 0) {
    return (
      <section id="projects" className="projects">
        <div className="projects-inner">
          <p className="section-tag">Projets</p>
          <h2>Mes réalisations</h2>
          <p className="projects-empty">Les projets arrivent bientôt...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="projects">
      <div className="projects-inner">
        <p className="section-tag">Projets</p>
        <h2>Mes réalisations</h2>
        <div className="projects-grid">
          {projects.map((p) => (
            <article key={p.id} className={`project-card ${p.featured ? "featured" : ""}`}>
              <div className="project-img">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} width="320" height="200" />
                ) : (
                  <div className="project-img-placeholder">
                    <i className="fa-solid fa-code" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="project-body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                {p.stack?.length > 0 && (
                  <div className="project-stack">
                    {p.stack.map((t, i) => (
                      <span key={i} className="stack-tag">{t}</span>
                    ))}
                  </div>
                )}
                <div className="project-links">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Voir le site
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-link btn-link-ghost">
                      <i className="fa-brands fa-github" aria-hidden="true" /> Code
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
