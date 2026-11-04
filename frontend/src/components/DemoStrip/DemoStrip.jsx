import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { METIERS } from "../../data/metiers";
import "./DemoStrip.css";

// Bandeau des sites de démonstration sous le hero de l'accueil : captures réelles qui défilent, un clic mène à la page du métier
// (en français) ou au site de démonstration (autres langues, les pages métier n'existant qu'en français).
// Les doublons de METIERS (la page Toulouse reprend la démo du barbier) sont écartés.
const DEMOS = METIERS.filter((m, i, all) => m.demo && all.findIndex((o) => o.demo?.url === m.demo.url) === i);

export default function DemoStrip() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  // La liste est affichée deux fois pour boucler sans saut ; la copie est masquée aux lecteurs d'écran et sortie de l'ordre de tabulation
  const items = [...DEMOS.map((m) => ({ m, copy: false })), ...DEMOS.map((m) => ({ m, copy: true }))];

  return (
    <section className="demo-strip" aria-labelledby="demo-strip-title">
      <div className="container demo-strip-head reveal">
        <h2 id="demo-strip-title" className="eyebrow">{t("home.strip_title")}</h2>
        <p className="demo-strip-note">{t("home.strip_note")}</p>
      </div>
      <div className="demo-strip-viewport">
        <ul className="demo-strip-track">
          {items.map(({ m, copy }, i) => {
            const inner = (
              <>
                <span className="demo-frame">
                  <span className="demo-frame-bar" aria-hidden="true"><i /><i /><i /></span>
                  <img src={m.demo.image} alt="" loading="lazy" width="1600" height="790" />
                </span>
                <span className="demo-name">{m.demo.name}</span>
              </>
            );
            const common = { className: "demo-card", tabIndex: copy ? -1 : undefined };
            return (
              <li key={`${m.slug}-${i}`} aria-hidden={copy ? "true" : undefined}>
                {lang === "fr"
                  ? <Link to={`/fr/${m.slug}`} {...common}>{inner}</Link>
                  : <a href={m.demo.url} target="_blank" rel="noopener noreferrer" {...common}>{inner}</a>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
