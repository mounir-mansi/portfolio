import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_HREF,
  GITHUB_URL,
} from "../../utils/contactInfo";
import "./Footer.css";

export default function Footer({ hideCta = false }) {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  return (
    <footer className={`footer ${hideCta ? "footer--compact" : ""}`}>
      <div className="container footer-inner">
        {!hideCta && (
          <div className="footer-cta">
            <p className="eyebrow">{t("footer.eyebrow")}</p>
            <Link to={{ pathname: `/${lang}`, hash: "#devis" }} className="footer-big">
              {t("footer.big")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}

        <div className="footer-contact">
          <ul className="footer-contact-list">
            <li><a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a></li>
            <li>
              <a href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </li>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          </ul>
          <p className="footer-zone">{t("footer.zone")}</p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} ManDev Web — {t("footer.rights")}
          </p>
          <ul className="footer-links">
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
            </li>
            <li>
              <Link to={`/${lang}/contact`}>Contact</Link>
            </li>
            <li>
              <Link to={`/${lang}/projets`}>{t("nav.projects")}</Link>
            </li>
          </ul>
        </div>

        <ul className="footer-legal">
          <li><Link to={`/${lang}/mentions-legales`}>{t("legal.mentions")}</Link></li>
          <li><Link to={`/${lang}/confidentialite`}>{t("legal.privacy_short")}</Link></li>
          <li><Link to={`/${lang}/cgv`}>{t("legal.terms_short")}</Link></li>
        </ul>
      </div>
    </footer>
  );
}
