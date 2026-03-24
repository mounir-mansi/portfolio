import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://github.com/mounir-mansi" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-github" /> GitHub
        </a>
        <a href="/contact"><i className="fa-solid fa-envelope" /> Contact</a>
      </div>
      <p className="footer-copy">&copy; {new Date().getFullYear()} ManDev Web — Tous droits réservés</p>
    </footer>
  );
}
