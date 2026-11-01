import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { collecterTitre } from "./ssrHead";

// Titre d'onglet propre à chaque page : « Page — ManDev Web » (ou le titre complet avec { full: true }).
// Se met à jour quand la langue change.
export default function usePageTitle(title, { full = false } = {}) {
  const { t } = useTranslation();

  // Prérendu : le titre est déposé dans le collecteur (les effets ne s'exécutent pas côté serveur)
  if (import.meta.env.SSR && title) collecterTitre(full ? title : `${title} — ${t("meta.suffix")}`);

  useEffect(() => {
    if (!title) return;
    document.title = full ? title : `${title} — ${t("meta.suffix")}`;
  }, [title, full, t]);
}
