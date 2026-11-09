import { useEffect } from "react";

// Page non destinée à Google (lien envoyé à un client) : on la marque « noindex » le temps de la visite
export default function useNoindex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}
