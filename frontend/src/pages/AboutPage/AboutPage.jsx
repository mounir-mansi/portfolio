import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import SkillsIndex from "../../components/SkillsIndex/SkillsIndex";
import { apiFetch } from "../../utils/api";
import usePageTitle from "../../utils/usePageTitle";
import "./AboutPage.css";

const VALUES = ["security", "perf", "responsive", "deploy"];
const JOURNEY = ["simplon", "python", "wcs", "self"];

export default function AboutPage() {
  const [section, setSection] = useState(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const lp = (path) => `/${lang}${path}`;
  const { hash } = useLocation();
  usePageTitle(t("meta.about"));

  // Ancre (#stack) après une redirection depuis l'ancienne page Compétences
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  useEffect(() => {
    apiFetch(`/api/sections?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setSection(d.about || null))
      .catch(() => {});
  }, [lang]);

  const text = section?.text || null;

  return (
    <Layout>
      <header className="page-head container">
        <h1 className="page-title">{t("about.title1")}<br />{t("about.title2")}</h1>
      </header>

      <div className="page-body container about-body">
        <div className="about-text">
          {text ? (
            <p>{text}</p>
          ) : (
            <>
              <p>{t("about.p1")}</p>
              <p>{t("about.p2")}</p>
            </>
          )}
          <div className="about-ctas">
            <Link to={lp("/projets")} className="btn-primary">{t("about.see_projects")}</Link>
            <Link to={lp("/contact")} className="btn-outline">{t("about.contact")}</Link>
          </div>
        </div>

        <ul className="about-rows">
          {VALUES.map((v) => (
            <li key={v} className="about-row">
              <h2 className="about-row-title">{t(`about.val_${v}`)}</h2>
              <p className="about-row-text">{t(`about.val_${v}_desc`)}</p>
            </li>
          ))}
        </ul>

        <section id="stack" aria-labelledby="about-stack-title">
          <h2 id="about-stack-title" className="about-section-title">{t("skills.title")}</h2>
          <p className="about-section-intro">{t("skills.intro")}</p>
          <SkillsIndex />
        </section>

        <section>
          <h2 className="about-section-title">{t("about.timeline_title")}</h2>
          <ol className="about-rows">
            {JOURNEY.map((j) => (
              <li key={j} className="about-row">
                <h3 className="about-row-title">{t(`about.${j}_title`)}</h3>
                <p className="about-row-text">{t(`about.${j}_text`)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Layout>
  );
}
