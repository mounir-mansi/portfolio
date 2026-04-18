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
      <div className="skills-page">
        <div className="skills-page-header">
          <h1>{t("skills.title")}</h1>
          <p className="skills-intro">{t("skills.intro")}</p>
        </div>

        <div className="skills-page-body">
          {categories.map((cat) => (
            <div key={cat} className="skills-cat-block">
              <h2 className="cat-label">{getCatLabel(cat)}</h2>
              <div className="skills-grid">
                {skills.filter((s) => s.category === cat).map((s, i) => (
                  <div key={i} className="skill-card">
                    <i className={s.icon || "fa-solid fa-code"} aria-hidden="true" />
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
