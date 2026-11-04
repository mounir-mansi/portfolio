import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./HoverVideo.css";

// Vignette d'un site de démonstration : une affiche, et une vidéo muette qui se joue quand le visiteur survole la carte.
// Les fichiers viennent de scripts/enregistrer-demos.mjs (voir demoMedia dans data/metiers.js).
// - Souris : lecture au survol de la carte (le <a> qui contient la vignette), arrêt à la sortie.
// - Clavier : lecture au focus de ce lien.
// - Sans souris (téléphone, tablette) : lecture quand la carte passe au centre de l'écran, sur l'axe de défilement (`axis`).
// - Mouvement réduit ou prérendu : l'affiche seule, la vidéo n'est pas montée.
// La vidéo ne se charge qu'au premier survol (preload="none") : la page garde son poids.
const REDUIT = "(prefers-reduced-motion: reduce)";
const mouvementAutorise = () => !window.matchMedia(REDUIT).matches;
const abonnerMouvement = (rappel) => {
  const mq = window.matchMedia(REDUIT);
  mq.addEventListener("change", rappel);
  return () => mq.removeEventListener("change", rappel);
};

export default function HoverVideo({ poster, src, axis = "y" }) {
  const racine = useRef(null);
  const video = useRef(null);
  const pret = useSyncExternalStore(abonnerMouvement, mouvementAutorise, () => false);
  const [enLecture, setEnLecture] = useState(false);

  const lire = useCallback(() => {
    video.current?.play().catch(() => {}); // refus ou interruption par un arrêt immédiat : l'affiche reste, rien à signaler
  }, []);

  const arreter = useCallback(() => {
    video.current?.pause();
    setEnLecture(false);
  }, []);

  // La vidéo repart du début une fois l'affiche revenue (fondu terminé)
  useEffect(() => {
    if (enLecture) return undefined;
    const id = setTimeout(() => { if (video.current) video.current.currentTime = 0; }, 400);
    return () => clearTimeout(id);
  }, [enLecture]);

  useEffect(() => {
    const hote = racine.current?.closest("a");
    if (!pret || !hote) return undefined;

    const entre = (e) => { if (e.pointerType === "mouse") lire(); };
    const sort = (e) => { if (e.pointerType === "mouse") arreter(); };
    hote.addEventListener("pointerenter", entre);
    hote.addEventListener("pointerleave", sort);
    hote.addEventListener("focus", lire);
    hote.addEventListener("blur", arreter);

    let observateur;
    if (window.matchMedia("(hover: none)").matches) {
      const bande = axis === "x" ? "0px -42% 0px -42%" : "-42% 0px -42% 0px";
      observateur = new IntersectionObserver(([entry]) => (entry.isIntersecting ? lire() : arreter()), { rootMargin: bande });
      observateur.observe(hote);
    }

    return () => {
      hote.removeEventListener("pointerenter", entre);
      hote.removeEventListener("pointerleave", sort);
      hote.removeEventListener("focus", lire);
      hote.removeEventListener("blur", arreter);
      observateur?.disconnect();
    };
  }, [pret, axis, lire, arreter]);

  return (
    <span ref={racine} className={`hover-video${enLecture ? " is-playing" : ""}`}>
      <img src={poster} alt="" loading="lazy" width="960" height="600" draggable="false" />
      {pret && (
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          draggable="false"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setEnLecture(true)}
        >
          <source src={src} type="video/webm" />
        </video>
      )}
    </span>
  );
}
