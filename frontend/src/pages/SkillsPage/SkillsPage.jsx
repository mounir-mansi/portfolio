import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./SkillsPage.css";

const DEFAULT_SKILLS = [
  { category: "Frontend", name: "React", icon: "fa-brands fa-react" },
  { category: "Frontend", name: "Next.js", icon: "fa-solid fa-n" },
  { category: "Frontend", name: "TypeScript", icon: "fa-solid fa-code" },
  { category: "Frontend", name: "Tailwind CSS", icon: "fa-solid fa-wand-magic-sparkles" },
  { category: "Frontend", name: "Vite", icon: "fa-solid fa-bolt" },
  { category: "Frontend", name: "CSS / Responsive", icon: "fa-brands fa-css3-alt" },
  { category: "Backend", name: "Node.js", icon: "fa-brands fa-node-js" },
  { category: "Backend", name: "Express", icon: "fa-solid fa-server" },
  { category: "Backend", name: "REST API", icon: "fa-solid fa-plug" },
  { category: "Backend", name: "JWT", icon: "fa-solid fa-key" },
  { category: "Backend", name: "Prisma", icon: "fa-solid fa-database" },
  { category: "Backend", name: "Zod", icon: "fa-solid fa-check-double" },
  { category: "Base de données", name: "PostgreSQL", icon: "fa-solid fa-database" },
  { category: "Base de données", name: "MySQL", icon: "fa-solid fa-database" },
  { category: "Déploiement", name: "Linux / VPS", icon: "fa-brands fa-linux" },
  { category: "Déploiement", name: "Nginx", icon: "fa-solid fa-globe" },
  { category: "Déploiement", name: "PM2", icon: "fa-solid fa-circle-play" },
  { category: "Déploiement", name: "Cloudflare", icon: "fa-solid fa-shield" },
  { category: "Déploiement", name: "SSL / HTTPS", icon: "fa-solid fa-lock" },
  { category: "Outils", name: "Git / GitHub", icon: "fa-brands fa-github" },
  { category: "Outils", name: "Fail2ban", icon: "fa-solid fa-ban" },
  { category: "Outils", name: "UFW", icon: "fa-solid fa-fire-flame-curved" },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);

  useEffect(() => {
    apiFetch("/api/skills")
      .then((r) => r.json())
      .then((data) => { if (data?.length > 0) setSkills(data); })
      .catch(() => {});
  }, []);

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <Layout>
      <div className="skills-page">
        <div className="skills-page-header">
          <h1>Ma stack technique</h1>
          <p className="skills-intro">
            Les technologies que j'utilise pour concevoir, développer et déployer des projets web complets — du frontend au serveur.
          </p>
        </div>

        <div className="skills-page-body">
            {categories.map((cat) => (
              <div key={cat} className="skills-cat-block">
                <h2 className="cat-label">{cat}</h2>
                <div className="skills-grid">
                  {skills.filter((s) => s.category === cat).map((s, i) => (
                    <div key={i} className="skill-card">
                      <i className={s.icon || "fa-solid fa-code"} />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
      </div>
    </Layout>
  );
}
