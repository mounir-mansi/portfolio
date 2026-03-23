import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./HomePage.css";

export default function HomePage() {
  const [section, setSection] = useState(null);

  useEffect(() => {
    apiFetch("/api/sections")
      .then((r) => r.json())
      .then((d) => setSection(d.hero || null))
      .catch(() => {});
  }, []);

  const bg = section?.imageUrl || null;

  return (
    <Layout>
      <section
        className="home-hero"
        style={bg ? { backgroundImage: `url(${bg})` } : {}}
      >
        <div className="home-overlay" />
        <div className="home-content">
          <p className="home-greeting">Bonjour, je suis</p>
          <h1 className="home-title">Mounir</h1>
          <p className="home-subtitle">Développeur Fullstack — React &amp; Node.js</p>
          <p className="home-desc">
            Je conçois et déploie des applications web modernes, de la base de données au déploiement en production.
          </p>
          <div className="home-ctas">
            <Link to="/projets" className="btn-primary">Voir mes projets</Link>
            <Link to="/contact" className="btn-outline">Me contacter</Link>
            <a
              href="https://github.com/mounir-mansi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <i className="fa-brands fa-github" /> GitHub
            </a>
          </div>
          <div className="home-nav-cards">
            <Link to="/a-propos" className="nav-card">
              <i className="fa-solid fa-user" />
              <span>À propos</span>
            </Link>
            <Link to="/competences" className="nav-card">
              <i className="fa-solid fa-code" />
              <span>Compétences</span>
            </Link>
            <Link to="/projets" className="nav-card">
              <i className="fa-solid fa-briefcase" />
              <span>Projets</span>
            </Link>
            <Link to="/contact" className="nav-card">
              <i className="fa-solid fa-envelope" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
