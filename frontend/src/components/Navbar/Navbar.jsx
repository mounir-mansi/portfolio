import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../utils/useAuth";
import "./Navbar.css";

const LANGS = ["fr", "en", "it", "es"];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang = "fr" } = useParams();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Échap ferme le menu mobile et rend le focus au bouton
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const lp = (path) => `/${lang}${path}`;

  const isActive = (path) => location.pathname.startsWith(`/${lang}/${path}`);

  // Garde la page, la recherche et l'ancre en changeant de langue
  const switchLang = (newLang) => {
    const parts = location.pathname.split("/");
    parts[1] = newLang;
    const path = parts.join("/") || `/${newLang}`;
    navigate(`${path}${location.search}${location.hash}`);
    setOpen(false);
  };

  const close = () => setOpen(false);

  const NAV_LINKS = [
    { to: { pathname: lp(""), hash: "#services" }, label: t("nav.services"), key: "services" },
    { to: lp("/projets"), label: t("nav.projects"), key: "projets", active: isActive("projets") },
    { to: lp("/a-propos"), label: t("nav.about"), key: "a-propos", active: isActive("a-propos") },
  ];

  return (
    <header className={`navbar ${scrolled || open ? "navbar--solid" : ""}`}>
      <nav className="navbar-inner" aria-label={t("nav.aria_main")}>
        <Link to={lp("")} className="wordmark" onClick={close} aria-label="ManDev Web">
          mandev<span className="wordmark-dot">.</span>
        </Link>

        <button
          ref={burgerRef}
          className="burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("nav.aria_menu")}
          aria-expanded={open}
        >
          <span className={`burger-bars ${open ? "is-open" : ""}`} />
        </button>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <li key={l.key}>
              <Link
                to={l.to}
                className={l.active ? "active" : ""}
                aria-current={l.active ? "page" : undefined}
                onClick={close}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user && (
            <>
              <li>
                <Link to="/admin" onClick={close}>{t("nav.admin")}</Link>
              </li>
              <li>
                <button className="btn-logout" onClick={() => { logout(); close(); }}>
                  {t("nav.logout")}
                </button>
              </li>
            </>
          )}
          <li>
            <div className="lang-switcher" role="group" aria-label={t("nav.aria_lang_group")}>
              {LANGS.map((code) => (
                <button
                  key={code}
                  className={`lang-btn ${lang === code ? "lang-active" : ""}`}
                  onClick={() => switchLang(code)}
                  aria-label={t("nav.aria_lang", { code: code.toUpperCase() })}
                  aria-pressed={lang === code}
                >
                  {code}
                </button>
              ))}
            </div>
          </li>
          <li>
            <Link to={lp("/contact")} className="btn-cta" onClick={close}>
              {t("nav.quote")} <span aria-hidden="true">↗</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
