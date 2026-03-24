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

  const text = section?.text || null;

  return (
    <Layout>
      <div className="about-page">
        <div className="about-page-inner">
          <div className="about-left">
            <h1>Passionné par le web,<br />de bout en bout</h1>

            <div className="about-page-body">
              {text ? (
                <p>{text}</p>
              ) : (
                <>
                  <p>
                    Développeur fullstack freelance, je conçois et livre des applications web complètes —
                    du serveur jusqu'à l'interface — avec une attention particulière à la performance,
                    la sécurité et l'expérience utilisateur.
                  </p>
                  <p>
                    Je travaille sur des projets variés&#x202F;: plateformes métier, applications interactives,
                    outils sur mesure, sites vitrines. Disponible à distance, je m'adapte aux besoins de chaque client.
                  </p>
                </>
              )}
            </div>

            <div className="about-badges">
              <span className="badge">React</span>
              <span className="badge">Next.js</span>
              <span className="badge">TypeScript</span>
              <span className="badge">Node.js</span>
              <span className="badge">Express</span>
              <span className="badge">PostgreSQL</span>
              <span className="badge">MySQL</span>
              <span className="badge">Prisma</span>
              <span className="badge">Linux / VPS</span>
              <span className="badge">Nginx</span>
              <span className="badge">Cloudflare</span>
              <span className="badge">Git</span>
              <span className="badge">Vite</span>
              <span className="badge">REST API</span>
              <span className="badge">Tailwind</span>
              <span className="badge">JWT</span>
              <span className="badge">PM2</span>
            </div>

            <div className="about-ctas">
              <Link to="/projets" className="btn-about-primary">Voir mes projets</Link>
              <Link to="/contact" className="btn-about-outline">Me contacter</Link>
            </div>

            {/* Parcours */}
            <div className="about-timeline">
              <h2 className="timeline-title"><i className="fa-solid fa-route" /> Parcours</h2>
              <div className="timeline">

                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-label">Simplon</span>
                    <p>Diplôme Développeur Web &amp; Web Mobile — ma première immersion dans le monde du code. C'est là que tout a commencé&#x202F;: HTML, CSS, JavaScript, les bases du backend.</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot timeline-dot-sm" />
                  <div className="timeline-content">
                    <span className="timeline-label">Initiation Python</span>
                    <p>Une formation courte d'un mois pour explorer un autre paradigme — logique, scripting, automatisation. Une parenthèse qui a élargi ma façon de penser le code.</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-label">Wild Code School</span>
                    <p>Formation Fullstack JavaScript intensive — React, Node.js, bases de données, projets en équipe. Le niveau monte, les projets deviennent réels.</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot timeline-dot-accent" />
                  <div className="timeline-content">
                    <span className="timeline-label">Autodidacte — en continu</span>
                    <p>Après les formations, j'ai continué seul&#x202F;: déployer sur VPS, sécuriser des serveurs, construire des projets de A à Z. Essayer, échouer, comprendre, recommencer. C'est là que j'ai vraiment appris.</p>
                  </div>
                </div>

              </div>
            </div>
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
