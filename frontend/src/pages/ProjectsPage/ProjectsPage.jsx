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
      <header className="page-head container">
        <h1 className="page-title">{t("projects.title")}</h1>
        <p className="page-intro">{t("projects.intro")}</p>
      </header>

      <div className="page-body container">
        {loading ? (
          <div className="proj-features" aria-hidden="true">
            <div className="proj-skeleton" />
            <div className="proj-skeleton" />
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="proj-features">
                {featured.map((p) => (
                  <ProjectCard key={p.id} project={p} lp={lp} t={t} variant="feature" />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="proj-grid">
                {rest.map((p) => (
                  <ProjectCard key={p.id} project={p} lp={lp} t={t} variant="regular" />
                ))}
              </div>
            )}

            {projects.length === 0 && (
              <p className="projects-empty">{t("projects.empty")}</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

// Le titre porte le lien vers le détail (::after étend la zone cliquable à toute la carte).
// « Voir le site » est un frère du titre, pas un enfant : pas de lien imbriqué.
function ProjectCard({ project: p, lp, t, variant }) {
  const Heading = variant === "feature" ? "h2" : "h3";
  return (
    <article className={`proj proj--${variant}`}>
      <div className="proj-media">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="proj-media-empty" />
        )}
      </div>
      <div className="proj-body">
        <Heading className="proj-title">
          <Link to={lp(`/projets/${p.id}`)} className="proj-link">{p.title}</Link>
        </Heading>
        <p className="proj-desc">{p.description}</p>
        {p.stack?.length > 0 && (
          <ul className="proj-stack">
            {p.stack.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        )}
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="proj-site">
            {t("projects.see_site")}
          </a>
        )}
      </div>
    </article>
  );
}
