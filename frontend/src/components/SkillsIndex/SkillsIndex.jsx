import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../utils/api";
import "./SkillsIndex.css";

const DEFAULT_SKILLS = [
  { category: "Frontend", name: "React" },
  { category: "Frontend", name: "Next.js" },
  { category: "Frontend", name: "TypeScript" },
  { category: "Frontend", name: "Tailwind CSS" },
  { category: "Frontend", name: "Vite" },
  { category: "Frontend", name: "CSS / Responsive" },
  { category: "Backend", name: "Node.js" },
  { category: "Backend", name: "Express" },
  { category: "Backend", name: "REST API" },
  { category: "Backend", name: "JWT" },
  { category: "Backend", name: "Prisma" },
  { category: "Backend", name: "Zod" },
  { category: "database", name: "PostgreSQL" },
  { category: "database", name: "MySQL" },
  { category: "deploy", name: "Linux / VPS" },
  { category: "deploy", name: "Nginx" },
  { category: "deploy", name: "PM2" },
  { category: "deploy", name: "Cloudflare" },
  { category: "deploy", name: "SSL / HTTPS" },
  { category: "tools", name: "Git / GitHub" },
  { category: "tools", name: "Fail2ban" },
  { category: "tools", name: "UFW" },
];

// Mappe les catégories de l'API vers les titres-bénéfices traduits
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

// Rangées éditoriales : titre-bénéfice à gauche, technologies à droite
export default function SkillsIndex() {
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
    <ul className="skills-index">
      {categories.map((cat) => (
        <li key={cat} className="skills-index-row">
          <h3 className="skills-index-title">{getCatLabel(cat)}</h3>
          <ul className="skills-index-tech">
            {skills.filter((s) => s.category === cat).map((s, i) => (
              <li key={i}>{s.name}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
