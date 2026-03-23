import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./SkillsPage.css";

const DEFAULT_SKILLS = [
  { category: "Frontend", name: "React", icon: "fa-brands fa-react" },
  { category: "Frontend", name: "Vite", icon: "fa-solid fa-bolt" },
  { category: "Frontend", name: "CSS / Responsive", icon: "fa-brands fa-css3-alt" },
  { category: "Backend", name: "Node.js", icon: "fa-brands fa-node-js" },
  { category: "Backend", name: "Express", icon: "fa-solid fa-server" },
  { category: "Backend", name: "Prisma", icon: "fa-solid fa-database" },
  { category: "Base de données", name: "PostgreSQL", icon: "fa-solid fa-database" },
  { category: "Déploiement", name: "Linux / VPS", icon: "fa-brands fa-linux" },
  { category: "Déploiement", name: "Nginx", icon: "fa-solid fa-globe" },
  { category: "Déploiement", name: "PM2", icon: "fa-solid fa-circle-play" },
  { category: "Outils", name: "Git / GitHub", icon: "fa-brands fa-github" },
  { category: "Outils", name: "Cloudflare", icon: "fa-solid fa-shield" },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/skills")
      .then((r) => r.json())
      .then(setSkills)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = skills.length > 0 ? skills : DEFAULT_SKILLS;
  const categories = [...new Set(data.map((s) => s.category))];

  return (
    <Layout>
      <div className="skills-page">
        <div className="skills-page-header">
          <p className="section-tag">Compétences</p>
          <h1>Ma stack technique</h1>
          <p className="skills-intro">
            Les technologies que j'utilise au quotidien pour concevoir, développer et déployer des projets web complets.
          </p>
        </div>

        {loading ? (
          <p className="skills-loading">Chargement...</p>
        ) : (
          <div className="skills-page-body">
            {categories.map((cat) => (
              <div key={cat} className="skills-cat-block">
                <h2 className="cat-label">{cat}</h2>
                <div className="skills-grid">
                  {data.filter((s) => s.category === cat).map((s, i) => (
                    <div key={i} className="skill-card">
                      <i className={s.icon || "fa-solid fa-code"} />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
