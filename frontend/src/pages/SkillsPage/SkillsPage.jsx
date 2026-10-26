import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  { category: "database", name: "PostgreSQL", icon: "fa-solid fa-database" },
  { category: "database", name: "MySQL", icon: "fa-solid fa-database" },
  { category: "deploy", name: "Linux / VPS", icon: "fa-brands fa-linux" },
  { category: "deploy", name: "Nginx", icon: "fa-solid fa-globe" },
  { category: "deploy", name: "PM2", icon: "fa-solid fa-circle-play" },
  { category: "deploy", name: "Cloudflare", icon: "fa-solid fa-shield" },
  { category: "deploy", name: "SSL / HTTPS", icon: "fa-solid fa-lock" },
  { category: "tools", name: "Git / GitHub", icon: "fa-brands fa-github" },
  { category: "tools", name: "Fail2ban", icon: "fa-solid fa-ban" },
  { category: "tools", name: "UFW", icon: "fa-solid fa-fire-flame-curved" },
];

// Mappe les catégories FR de l'API vers les clés de traduction
const CAT_KEY_MAP = {
  "Frontend": "cat_frontend",
  "Backend": "cat_backend",
  "frontend": "cat_frontend",
  "backend": "cat_backend",
  "Base de données": "cat_database",
  "Déploiement": "cat_deploy",
  "Outils": "cat_tools",
  "database": "cat_database",
  "deploy": "cat_deploy",
  "tools": "cat_tools",
};

export default function SkillsPage() {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch("/api/skills")
      .then((r) => r.json())
      .then((data) => { if (data?.length > 0) setSkills(data); })
      .catch(() => {});
  }, []);

  const getCatLabel = (cat) => {
    const key = CAT_KEY_MAP[cat];
    return key ? t(`skills.${key}`) : cat;
  };

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <Layout>
      <header className="page-head container">
        <h1 className="page-title">{t("skills.title")}</h1>
        <p className="page-intro">{t("skills.intro")}</p>
      </header>

      <div className="page-body container">
        <ul className="skills-index">
          {categories.map((cat) => (
            <li key={cat} className="skills-index-row">
              <h2 className="skills-index-title">{getCatLabel(cat)}</h2>
              <ul className="skills-index-tech">
                {skills.filter((s) => s.category === cat).map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
