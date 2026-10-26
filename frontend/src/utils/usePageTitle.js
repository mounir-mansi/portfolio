import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Titre d'onglet propre à chaque page : « Page — ManDev Web » (ou le titre complet avec { full: true }).
// Se met à jour quand la langue change.
export default function usePageTitle(title, { full = false } = {}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!title) return;
    document.title = full ? title : `${title} — ${t("meta.suffix")}`;
  }, [title, full, t]);
}
