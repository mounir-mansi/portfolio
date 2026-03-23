import "./Skills.css";

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

export default function Skills({ skills }) {
  const data = skills.length > 0 ? skills : DEFAULT_SKILLS;

  const categories = [...new Set(data.map((s) => s.category))];

  return (
    <section id="skills" className="skills">
      <div className="skills-inner">
        <p className="section-tag">Compétences</p>
        <h2>Ma stack technique</h2>
        <div className="skills-categories">
          {categories.map((cat) => (
            <div key={cat} className="skills-cat">
              <h3 className="cat-title">{cat}</h3>
              <div className="skills-grid">
                {data
                  .filter((s) => s.category === cat)
                  .map((s, i) => (
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
    </section>
  );
}
