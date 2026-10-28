import { useCallback, useSyncExternalStore } from "react";

// true tant que la requête CSS est vérifiée (ex. « (min-width: 1024px) »), et se met à jour au redimensionnement
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", callback);
      return () => list.removeEventListener("change", callback);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
