import { useCallback, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { METIERS, demoMedia } from "../../data/metiers";
import HoverVideo from "../HoverVideo/HoverVideo";
import "./DemoStrip.css";

// Bandeau des sites de démonstration sous le hero de l'accueil : captures réelles, un clic mène à la page du métier
// (en français) ou au site de démonstration (autres langues, les pages métier n'existant qu'en français).
// Les doublons de METIERS (la page Toulouse reprend la démo du barbier) sont écartés.
//
// Le bandeau est une zone à défilement natif (souris, doigt, trackpad, flèches du clavier) qui avance aussi seule, lentement.
// L'avance automatique s'arrête au survol, au clavier et pendant que le visiteur le manipule, puis reprend un peu après.
const DEMOS = METIERS.filter((m, i, all) => m.demo && all.findIndex((o) => o.demo?.url === m.demo.url) === i);

const VITESSE = 28; // pixels par seconde
const REPRISE_MS = 2500; // l'avance automatique reprend 2,5 s après la dernière manipulation
const SEUIL_GLISSE = 6; // pixels de glissement à la souris avant de considérer que ce n'est plus un clic

// Chaque carte montre une affiche (accueil du site) ; HoverVideo joue la vidéo de cet accueil (héros animé, puis défilement
// jusqu'en bas) au survol, au focus clavier, ou, sans souris, quand la carte passe au centre de l'écran.
function DemoCard({ m, copy, lang }) {
  const base = demoMedia(m);
  const inner = (
    <>
      <span className="demo-frame">
        <span className="demo-frame-bar" aria-hidden="true"><i /><i /><i /></span>
        <HoverVideo poster={`${base}.webp`} src={`${base}.webm`} axis="x" />
      </span>
      <span className="demo-name">{m.demo.name}</span>
    </>
  );
  const common = { className: "demo-card", tabIndex: copy ? -1 : undefined, draggable: false };
  return (
    <li aria-hidden={copy ? "true" : undefined}>
      {lang === "fr"
        ? <Link to={`/fr/${m.slug}`} {...common}>{inner}</Link>
        : <a href={m.demo.url} target="_blank" rel="noopener noreferrer" {...common}>{inner}</a>}
    </li>
  );
}

export default function DemoStrip() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const viewport = useRef(null);
  const track = useRef(null);
  const derniereAction = useRef(0);

  // La liste est affichée deux fois pour boucler sans saut ; la copie est masquée aux lecteurs d'écran et sortie de l'ordre de tabulation
  const items = [...DEMOS.map((m) => ({ m, copy: false })), ...DEMOS.map((m) => ({ m, copy: true }))];

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return undefined;

    // Mouvement réduit : défilement à la main uniquement, une seule série affichée (voir le CSS)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    // Distance d'une série complète : de la première carte à la première carte de la copie
    const mesurer = () => tr.children[DEMOS.length].offsetLeft - tr.children[0].offsetLeft;
    let moitie = mesurer();
    // On démarre au début de la copie : on peut ainsi aller à gauche comme à droite sans jamais buter
    vp.scrollLeft = moitie;

    let pos = vp.scrollLeft; // position en décimales (le navigateur arrondit scrollLeft)
    let survol = false;
    let focus = false;
    let visible = true;
    let precedent = performance.now();
    let raf = 0;

    // Bouclage : près d'un bord, on saute d'une série (le contenu affiché est identique, aucun saut visible)
    const reboucler = () => {
      const max = vp.scrollWidth - vp.clientWidth;
      if (vp.scrollLeft >= max - 2) vp.scrollLeft -= moitie;
      else if (vp.scrollLeft <= 1) vp.scrollLeft += moitie;
    };

    const tick = (maintenant) => {
      const dt = Math.min(64, maintenant - precedent);
      precedent = maintenant;
      const enPause = survol || focus || !visible || maintenant - derniereAction.current < REPRISE_MS;
      if (enPause) {
        pos = vp.scrollLeft;
      } else {
        // Si le visiteur (ou le bouclage) a déplacé la zone entre deux images, on repart de la position réelle
        if (Math.abs(vp.scrollLeft - pos) > 2) pos = vp.scrollLeft;
        pos += (VITESSE * dt) / 1000;
        vp.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const marquer = () => { derniereAction.current = performance.now(); };
    const entree = () => { survol = true; };
    const sortie = () => { survol = false; };
    const prendFocus = () => { focus = true; };
    const perdFocus = () => { focus = false; };
    const surResize = () => { moitie = mesurer(); };

    // Glissement à la souris (le doigt et le trackpad utilisent le défilement natif)
    let glisse = null;
    let aBouge = false;
    const bouger = (e) => {
      const dx = e.clientX - glisse.x;
      if (Math.abs(dx) > SEUIL_GLISSE) {
        aBouge = true;
        vp.classList.add("is-dragging");
      }
      if (aBouge) vp.scrollLeft = glisse.left - dx;
      marquer();
    };
    const lacher = () => {
      glisse = null;
      vp.classList.remove("is-dragging");
      window.removeEventListener("pointermove", bouger);
      window.removeEventListener("pointerup", lacher);
      window.removeEventListener("pointercancel", lacher);
    };
    const appuie = (e) => {
      marquer();
      aBouge = false;
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      glisse = { x: e.clientX, left: vp.scrollLeft };
      window.addEventListener("pointermove", bouger);
      window.addEventListener("pointerup", lacher);
      window.addEventListener("pointercancel", lacher);
    };
    // Un glissement à la souris ne doit pas ouvrir la page sur laquelle on relâche
    const filtrerClic = (e) => {
      if (aBouge) {
        e.preventDefault();
        e.stopPropagation();
        aBouge = false;
      }
    };

    const observateur = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    observateur.observe(vp);

    vp.addEventListener("scroll", reboucler, { passive: true });
    vp.addEventListener("wheel", marquer, { passive: true });
    vp.addEventListener("touchstart", marquer, { passive: true });
    vp.addEventListener("keydown", marquer);
    vp.addEventListener("pointerdown", appuie);
    vp.addEventListener("click", filtrerClic, true);
    vp.addEventListener("mouseenter", entree);
    vp.addEventListener("mouseleave", sortie);
    vp.addEventListener("focusin", prendFocus);
    vp.addEventListener("focusout", perdFocus);
    window.addEventListener("resize", surResize);

    return () => {
      cancelAnimationFrame(raf);
      observateur.disconnect();
      lacher();
      vp.removeEventListener("scroll", reboucler);
      vp.removeEventListener("wheel", marquer);
      vp.removeEventListener("touchstart", marquer);
      vp.removeEventListener("keydown", marquer);
      vp.removeEventListener("pointerdown", appuie);
      vp.removeEventListener("click", filtrerClic, true);
      vp.removeEventListener("mouseenter", entree);
      vp.removeEventListener("mouseleave", sortie);
      vp.removeEventListener("focusin", prendFocus);
      vp.removeEventListener("focusout", perdFocus);
      window.removeEventListener("resize", surResize);
    };
  }, []);

  // Flèches : une carte à la fois, en douceur
  const defiler = useCallback((sens) => {
    const vp = viewport.current;
    const carte = track.current?.children[0];
    if (!vp || !carte) return;
    derniereAction.current = performance.now();
    const ecart = parseFloat(getComputedStyle(track.current).columnGap) || 0;
    vp.scrollBy({ left: sens * (carte.offsetWidth + ecart), behavior: "smooth" });
  }, []);

  return (
    <section className="demo-strip" aria-labelledby="demo-strip-title">
      <div className="container demo-strip-head reveal">
        <h2 id="demo-strip-title" className="eyebrow">{t("home.strip_title")}</h2>
        <p className="demo-strip-note">{t("home.strip_note")}</p>
        <div className="demo-strip-nav">
          <button type="button" className="demo-strip-btn" onClick={() => defiler(-1)} aria-label={t("home.strip_prev")}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" className="demo-strip-btn" onClick={() => defiler(1)} aria-label={t("home.strip_next")}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className="demo-strip-viewport" ref={viewport} tabIndex={0} role="region" aria-label={t("home.strip_title")}>
        <ul className="demo-strip-track" ref={track}>
          {items.map(({ m, copy }, i) => (
            <DemoCard key={`${m.slug}-${i}`} m={m} copy={copy} lang={lang} />
          ))}
        </ul>
      </div>
    </section>
  );
}
