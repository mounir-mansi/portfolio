import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import "./Navbar.css";

const NAV_LINKS = [
  { href: "/#home", label: "Accueil" },
  { href: "/#about", label: "À propos" },
  { href: "/#skills", label: "Compétences" },
  { href: "/#projects", label: "Projets" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="/#home" className="navbar-logo">
        <span className="logo-name">Mounir</span>
        <span className="logo-sub">Développeur Fullstack</span>
      </a>

      <button
        className="burger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
      </button>

      <ul className={`nav-links ${open ? "open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
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
          <a href="/#contact" className="btn-cta" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-envelope" /> Me contacter
          </a>
        </li>
      </ul>
    </nav>
  );
}
