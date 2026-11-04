import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { demoMedia } from "../../data/metiers";
import HoverVideo from "../HoverVideo/HoverVideo";

// Carte d'un site de démonstration dans une grille de projets (accueil et page Projets ; styles .project-card de HomePage.css).
// L'affiche s'anime au survol : courte vidéo du héros du site (fichiers <sous-domaine>-hero.webm, voir scripts/enregistrer-demos.mjs).
// En français, la carte mène à la page du métier ; dans les autres langues (pas de pages métier), au site de démonstration.
export default function WorkCard({ m, delay = 0 }) {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const base = demoMedia(m);
  const inner = (
    <>
      <span className="project-card-media">
        <HoverVideo poster={`${base}.webp`} src={`${base}-hero.webm`} axis="y" />
      </span>
      <span className="project-card-title">{m.demo.name}</span>
      <span className="project-card-desc">{t(`home.work_demos.${m.key}`)}</span>
    </>
  );
  return (
    <li className="project-card reveal" style={{ "--delay": `${delay}ms` }}>
      {lang === "fr"
        ? <Link to={`/fr/${m.slug}`} className="project-card-link">{inner}</Link>
        : <a href={m.demo.url} target="_blank" rel="noopener noreferrer" className="project-card-link">{inner}</a>}
    </li>
  );
}
