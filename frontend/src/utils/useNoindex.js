import { useEffect } from "react";
import { collecterRobots } from "./ssrHead";

// Page non destinée à Google (lien envoyé à un client, blog en cours de relecture) : on la marque « noindex ».
// Prérendu : la balise est aussi écrite dans le HTML de la page (Google lit ce HTML avant d'exécuter le JavaScript).
// Navigateur : on remplace la balise déjà présente dans la page prérendue, et on la retire en quittant la page.
export default function useNoindex(actif = true) {
  if (import.meta.env.SSR && actif) collecterRobots("noindex, nofollow");

  useEffect(() => {
    if (!actif) return;
    document.querySelectorAll('meta[name="robots"]').forEach((m) => m.remove());
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [actif]);
}
