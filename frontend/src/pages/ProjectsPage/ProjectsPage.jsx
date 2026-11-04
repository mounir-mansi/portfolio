import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import usePageTitle from "../../utils/usePageTitle";
import useReveal from "../../utils/useReveal";
import { preloaded } from "../../utils/preload";
import { metiersParCle } from "../../data/metiers";
import WorkCard from "../../components/WorkCard/WorkCard";
import "./ProjectsPage.css";

// Les sites de démonstration par métier, dans l'ordre d'affichage (Il Subito, la pizzeria, est déjà un projet de la base)
const SITES_METIER = metiersParCle(["restaurant", "boulangerie", "artisan", "garage", "barbier"]);

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  // Page prérendue : la liste est déjà dans le HTML, on la garde affichée pendant le rafraîchissement
  const [projects, setProjects] = useState(() => { const d = preloaded(`/api/projects?lang=${lang}`); return Array.isArray(d) ? d : []; });
  const [loading, setLoading] = useState(() => !Array.isArray(preloaded(`/api/projects?lang=${lang}`)));
  const lp = (path) => `/${lang}${path}`;
  usePageTitle(t("meta.projects"));
  useReveal([projects.length, loading, lang]);

  useEffect(() => {
    apiFetch(`/api/projects?lang=${lang}`)
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <Layout>
      <header className="page-head container">
        <h1 className="page-title">{t("projects.title")}</h1>
        <p className="page-intro">{t("projects.intro")}</p>
      </header>

      <div className="page-body container">
        {/* Mêmes cartes que « Projets récents » de l'accueil (styles de HomePage.css) : d'abord les sites par métier (statiques,
            affichés sans attendre l'API), puis les projets de la base. Il Subito est dans la base : pas de doublon. */}
        <ul className="projects-grid" aria-busy={loading}>
          {SITES_METIER.map((m, i) => <WorkCard key={m.key} m={m} delay={i * 90} />)}
          {loading ? (
            <>
              <li className="proj-skeleton" aria-hidden="true" />
              <li className="proj-skeleton" aria-hidden="true" />
              <li className="proj-skeleton" aria-hidden="true" />
            </>
          ) : (
            projects.map((p, i) => (
              <li key={p.id} className="project-card reveal" style={{ "--delay": `${(SITES_METIER.length + i) * 90}ms` }}>
                <Link to={lp(`/projets/${p.id}`)} className="project-card-link">
                  <span className="project-card-media">
                    {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" width="1600" height="790" />}
                  </span>
                  <span className="project-card-title">{p.title}</span>
                  <span className="project-card-desc">{p.description}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </Layout>
  );
}
