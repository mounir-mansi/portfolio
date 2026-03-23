import "./Hero.css";

export default function Hero({ section }) {
  const bg = section?.imageUrl || null;

  return (
    <section
      id="home"
      className="hero"
      style={bg ? { backgroundImage: `url(${bg})` } : {}}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-greeting">Bonjour, je suis</p>
        <h1 className="hero-title">Mounir Mansi</h1>
        <p className="hero-subtitle">Développeur Fullstack — React &amp; Node.js</p>
        <p className="hero-desc">
          Je conçois et déploie des applications web modernes, de la base de données au déploiement en production.
        </p>
        <div className="hero-ctas">
          <a href="/#projects" className="btn-primary">Voir mes projets</a>
          <a href="/#contact" className="btn-outline">Me contacter</a>
          <a
            href="https://github.com/mounir-mansi"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <i className="fa-brands fa-github" /> GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
