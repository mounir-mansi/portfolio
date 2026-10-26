import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import usePageTitle from "../../utils/usePageTitle";
import { LEGAL } from "../../data/legal";
import "./LegalPage.css";

// Gabarit commun des pages légales. Le contenu est en français (langue du contrat) pour toutes les langues du site.
export default function LegalPage({ titleKey, children }) {
  const { t } = useTranslation();
  usePageTitle(t(titleKey));

  return (
    <Layout>
      <header className="page-head container">
        <h1 className="page-title">{t(titleKey)}</h1>
        <p className="legal-note">{t("legal.fr_only")}</p>
      </header>

      <div className="page-body container">
        <article className="legal-prose" lang="fr">
          {children}
          <p className="legal-updated">Dernière mise à jour : {LEGAL.updated}</p>
        </article>
      </div>
    </Layout>
  );
}
