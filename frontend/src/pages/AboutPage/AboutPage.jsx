import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./AboutPage.css";

export default function AboutPage() {
  const [section, setSection] = useState(null);

  useEffect(() => {
    apiFetch("/api/sections")
      .then((r) => r.json())
      .then((d) => setSection(d.about || null))
      .catch(() => {});
  }, []);

  const img = section?.imageUrl || null;
  const text = section?.text || null;

  return (
    <Layout>
      <div className="about-page">
        <div className="about-page-inner">
          <div className="about-page-text">
            <p className="section-tag">À propos</p>
            <h1>Passionné par le web,<br />de bout en bout</h1>
            <div className="about-page-body">
              {text ? (
                <p>{text}</p>
              ) : (
                <>
                  <p>
                    Développeur fullstack basé en France, je crée des applications web modernes avec
                    une attention particulière à la performance, la sécurité et l'expérience utilisateur.
                  </p>
                  <p>
                    De la conception de l'API à l'interface utilisateur, en passant par le déploiement
                    sur VPS — je prends en charge l'ensemble du cycle de vie d'un projet.
                  </p>
                  <p>
                    J'aime les projets concrets&#x202F;: sites vitrines pour des PME locales,
                    applications métier, ou outils sur mesure.
                  </p>
                </>
              )}
            </div>

            <div className="about-badges">
              <span className="badge">React</span>
              <span className="badge">Node.js</span>
              <span className="badge">PostgreSQL</span>
              <span className="badge">Linux / VPS</span>
              <span className="badge">Nginx</span>
              <span className="badge">Cloudflare</span>
            </div>

            <div className="about-ctas">
              <Link to="/projets" className="btn-about-primary">Voir mes projets</Link>
              <Link to="/contact" className="btn-about-outline">Me contacter</Link>
            </div>
          </div>

          <div className="about-page-photo">
            {img ? (
              <img src={img} alt="Mounir" />
            ) : (
              <div className="about-photo-placeholder">
                <i className="fa-solid fa-user" />
              </div>
            )}
          </div>
        </div>

        <div className="about-values">
          <div className="value-card">
            <i className="fa-solid fa-shield-halved" />
            <h3>Sécurité</h3>
            <p>JWT httpOnly, Fail2ban, UFW, Nginx — la sécurité n'est pas une option.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-bolt" />
            <h3>Performance</h3>
            <p>Build Vite optimisé, PostgreSQL avec Prisma, cache Cloudflare.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-mobile-screen" />
            <h3>Responsive</h3>
            <p>Chaque projet est testé sur mobile, tablette et desktop.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-rocket" />
            <h3>Déploiement</h3>
            <p>De zéro à la mise en production sur VPS avec SSL, PM2 et monitoring.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
