import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/competences", label: "Compétences" },
  { to: "/projets", label: "Projets" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar" aria-label="Navigation principale">
      <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
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
          <li key={l.to}>
            <Link
              to={l.to}
              className={location.pathname === l.to ? "active" : ""}
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
                Admin
              </Link>
            </li>
            <li>
              <button className="btn-logout" onClick={() => { logout(); setOpen(false); }}>
                Déconnexion
              </button>
            </li>
          </>
        )}
        <li>
          <Link to="/contact" className="btn-cta" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-envelope" aria-hidden="true" /> Me contacter
          </Link>
        </li>
      </ul>
    </nav>
  );
}
