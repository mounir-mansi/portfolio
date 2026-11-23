import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_HREF,
  GITHUB_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
} from "../../utils/contactInfo";
import { ACTIVITES, VILLES } from "../../data/metiers";
import { SERVICE_PAGES } from "../../data/services";
import { BLOG_PUBLIC, BLOG_SLUG } from "../../data/blog";
import "./Footer.css";

export default function Footer({ hideCta = false }) {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  // Libellé court dans le pied de page, titre SEO complet en infobulle (l'URL et la page ne changent pas)
  const lienPage = (cle, titreComplet, slug) => (
    <li key={slug}>
      <Link to={`/${lang}/${slug}`} title={t(titreComplet)}>
        {t(`footer.short.${cle}`, { defaultValue: t(titreComplet) })}
      </Link>
    </li>
  );

  const services = SERVICE_PAGES.filter((service) => lang === "fr" || service.multilang);

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

        <div className="footer-grid">
          {services.length > 0 && (
            <nav className="footer-col" aria-labelledby="footer-h-services">
              <h2 className="footer-title" id="footer-h-services">{t("footer.col_services")}</h2>
              <ul>
                {lang === "fr" && (
                  <li><Link to="/fr/services">{t("footer.all_services")}</Link></li>
                )}
                {services.map((service) =>
                  lienPage(service.key, `service_pages.${service.key}.meta_title`, service.slug)
                )}
              </ul>
            </nav>
          )}

          {lang === "fr" && (
            <nav className="footer-col" aria-labelledby="footer-h-metiers">
              <h2 className="footer-title" id="footer-h-metiers">{t("footer.col_metiers")}</h2>
              <ul>
                {ACTIVITES.map((metier) =>
                  lienPage(metier.key, `metiers.${metier.key}.meta_title`, metier.slug)
                )}
              </ul>
            </nav>
          )}

          {lang === "fr" && (
            <nav className="footer-col" aria-labelledby="footer-h-zones">
              <h2 className="footer-title" id="footer-h-zones">{t("footer.col_zones")}</h2>
              <ul>
                {VILLES.map((ville) =>
                  lienPage(ville.key, `metiers.${ville.key}.meta_title`, ville.slug)
                )}
              </ul>
            </nav>
          )}

          <div className="footer-col" role="group" aria-labelledby="footer-h-contact">
            <h2 className="footer-title" id="footer-h-contact">{t("footer.col_contact")}</h2>
            <ul>
              <li><a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a></li>
              <li>
                <a href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
              <li>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
            </ul>
            <p className="footer-zone">{t("footer.zone")}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} ManDev Web — {t("footer.rights")}
          </p>
          <ul className="footer-links">
            <li>
              <Link to={`/${lang}/contact`}>Contact</Link>
            </li>
            <li>
              <Link to={`/${lang}/projets`}>{t("nav.projects")}</Link>
            </li>
            {lang === "fr" && BLOG_PUBLIC && (
              <li>
                <Link to={`/fr/${BLOG_SLUG}`}>Blog</Link>
              </li>
            )}
            <li><Link to={`/${lang}/mentions-legales`}>{t("legal.mentions")}</Link></li>
            <li><Link to={`/${lang}/confidentialite`}>{t("legal.privacy_short")}</Link></li>
            <li><Link to={`/${lang}/cgv`}>{t("legal.terms_short")}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
