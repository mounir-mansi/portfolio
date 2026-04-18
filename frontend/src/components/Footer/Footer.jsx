import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://github.com/mounir-mansi" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-github" /> GitHub
        </a>
        <a href={`/${lang}/contact`}><i className="fa-solid fa-envelope" /> Contact</a>
      </div>
      <p className="footer-copy">&copy; {new Date().getFullYear()} ManDev Web — {t("footer.rights")}</p>
    </footer>
  );
}
