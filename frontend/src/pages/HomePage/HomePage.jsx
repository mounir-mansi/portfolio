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
        aria-labelledby="hero-title"
        style={bg ? { backgroundImage: `url(${bg})` } : {}}
      >
        <div className="home-overlay" />
        <div className="home-hero-inner">
        <div className="home-content">
          <p className="home-greeting">Bonjour, je suis</p>
          <h1 className="home-title" id="hero-title">Mounir</h1>
          <div className="home-badges">
            <span className="home-badge"><i className="fa-solid fa-code" aria-hidden="true" /> Développeur Fullstack</span>
            <span className="home-badge home-badge-accent"><i className="fa-solid fa-briefcase" aria-hidden="true" /> Freelance</span>
          </div>
          <p className="home-subtitle">React &amp; Node.js — de la DB au déploiement</p>
          <p className="home-desc">
            Disponible pour vos projets web : sites vitrines, applications sur mesure, APIs. Je gère tout, du backend sécurisé à la mise en production sur VPS.
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
              <i className="fa-brands fa-github" aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>
        <div className="home-logo-side">
          <img src="/logo-transparent.png" alt="ManDev Web" className="home-logo-img" width="520" height="520" />
        </div>
        </div>
      </section>
    </Layout>
  );
}
