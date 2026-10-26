import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-cta">
          <p className="eyebrow">{t("footer.eyebrow")}</p>
          <Link to={`/${lang}/contact`} className="footer-big">
            {t("footer.big")} <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} ManDev Web — {t("footer.rights")}
          </p>
          <ul className="footer-links">
            <li>
              <a href="https://github.com/mounir-mansi" target="_blank" rel="noopener noreferrer">GitHub</a>
            </li>
            <li>
              <Link to={`/${lang}/contact`}>Contact</Link>
            </li>
            <li>
              <Link to={`/${lang}/projets`}>{t("nav.projects")}</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
