import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import usePageTitle from "../../utils/usePageTitle";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  usePageTitle(t("meta.notfound"));

  // Une page d'erreur ne doit pas être indexée
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <Layout>
      <header className="page-head container">
        <h1 className="page-title">{t("notfound.title")}</h1>
        <p className="page-intro">{t("notfound.text")}</p>
      </header>

      <div className="page-body container notfound-links">
        <Link to={`/${lang}`} className="btn-primary">{t("notfound.home")}</Link>
        <Link to={`/${lang}/projets`} className="btn-outline">{t("notfound.projects")}</Link>
        <Link to={`/${lang}/contact`} className="btn-outline">{t("notfound.contact")}</Link>
      </div>
    </Layout>
  );
}
