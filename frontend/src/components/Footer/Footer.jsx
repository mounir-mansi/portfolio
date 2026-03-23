import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-name">Mounir</p>
      <p className="footer-sub">Développeur Fullstack — React &amp; Node.js</p>
      <div className="footer-links">
        <a href="https://github.com/mounir-mansi" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-github" /> GitHub
        </a>
        <a href="/#contact">Contact</a>
      </div>
      <p className="footer-copy">&copy; {new Date().getFullYear()} Mounir</p>
    </footer>
  );
}
