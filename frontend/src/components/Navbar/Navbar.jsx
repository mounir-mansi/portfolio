import { useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../utils/useAuth";
import "./Navbar.css";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "it", label: "IT" },
  { code: "es", label: "ES" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang = "fr" } = useParams();

  // Construit un lien prefixé par la langue courante
  const lp = (path) => `/${lang}${path}`;

  // Vérifie si un lien est actif
  const isActive = (path) => {
    if (path === "") return location.pathname === `/${lang}` || location.pathname === `/${lang}/`;
    return location.pathname.startsWith(`/${lang}/${path}`);
  };

  // Bascule vers une autre langue en conservant le sous-chemin actuel
  const switchLang = (newLang) => {
    const parts = location.pathname.split("/"); // ["", "fr", "a-propos", ...]
    parts[1] = newLang;
    navigate(parts.join("/") || `/${newLang}`);
    setOpen(false);
  };

  const NAV_LINKS = [
    { path: "", label: t("nav.home") },
    { path: "a-propos", label: t("nav.about") },
    { path: "competences", label: t("nav.skills") },
    { path: "projets", label: t("nav.projects") },
  ];

  return (
    <nav className="navbar" aria-label="Navigation principale">
      <Link to={lp("")} className="navbar-logo" onClick={() => setOpen(false)}>
        <img src="/logo-transparent.png" alt="ManDev Web" className="navbar-logo-img" width="48" height="48" />
      </Link>

      <button
        className="burger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
      </button>

      <ul className={`nav-links ${open ? "open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <li key={l.path}>
            <Link
              to={lp(l.path ? `/${l.path}` : "")}
              className={isActive(l.path) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          </li>
        ))}
        {user && (
          <>
            <li>
              <Link to="/admin" onClick={() => setOpen(false)}>
                {t("nav.admin")}
              </Link>
            </li>
            <li>
              <button className="btn-logout" onClick={() => { logout(); setOpen(false); }}>
                {t("nav.logout")}
              </button>
            </li>
          </>
        )}
        <li>
          <Link to={lp("/contact")} className="btn-cta" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-envelope" aria-hidden="true" /> {t("nav.contact")}
          </Link>
        </li>
        <li className="lang-switcher" aria-label="Choisir la langue">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${lang === l.code ? "lang-active" : ""}`}
              onClick={() => switchLang(l.code)}
              aria-label={`Langue : ${l.label}`}
            >
              {l.label}
            </button>
          ))}
        </li>
      </ul>
    </nav>
  );
}
