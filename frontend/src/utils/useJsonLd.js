import { useEffect } from "react";
import { collecterJsonLd } from "./ssrHead";

// Données structurées (JSON-LD) d'une page : [{ id, data }].
// Prérendu : déposées dans le collecteur (les effets ne s'exécutent pas côté serveur).
// Navigateur : on remplace celles déjà présentes dans la page prérendue pour éviter les doublons.
export default function useJsonLd(liste) {
  if (import.meta.env.SSR) liste.forEach(({ id, data }) => collecterJsonLd(id, data));

  const cle = JSON.stringify(liste);
  useEffect(() => {
    const scripts = JSON.parse(cle).map(({ id, data }) => {
      document.getElementById(id)?.remove();
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });
    return () => scripts.forEach((s) => s.remove());
  }, [cle]);
}
