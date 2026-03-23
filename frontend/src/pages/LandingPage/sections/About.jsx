import "./About.css";

export default function About({ section }) {
  const img = section?.imageUrl || null;
  const text = section?.text || null;

  return (
    <section id="about" className="about">
      <div className="about-wrapper">
        <div className="about-text">
          <p className="section-tag">À propos</p>
          <h2>Passionné par le web, de bout en bout</h2>
          <div className="about-body">
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
            <span className="badge">VPS / Linux</span>
          </div>
        </div>
        <div className="about-photo">
          {img ? (
            <img src={img} alt="Mounir" />
          ) : (
            <div className="about-photo-placeholder">
              <i className="fa-solid fa-user" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
