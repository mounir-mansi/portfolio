// Enregistre une courte vidéo de l'accueil de chaque site de démonstration, pour le bandeau du portfolio (DemoStrip).
// Chaque vidéo : le héros s'anime, une pause, puis défilement doux jusqu'en bas de l'accueil. Le bandeau « site fictif »
// des démos est masqué (il reste visible pour les vrais visiteurs, seule la vidéo est nettoyée).
//
// Usage : node scripts/enregistrer-demos.mjs [--hero] [slug ...]      (sans slug : toutes les démos)
// Sortie : frontend/public/demos/<slug>.webm  +  <slug>.webp (affiche, image du héros)
// Avec --hero : courte vidéo du seul héros (animations d'arrivée, sans défilement) <slug>-hero.webm, pour les cartes de projets.
// Les affiches ne sont pas réécrites dans ce mode.
//
// Playwright n'est pas une dépendance du portfolio : on réutilise celui d'un autre projet de la machine.
// Autre emplacement : PLAYWRIGHT_DIR=<dossier contenant node_modules/playwright>.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, existsSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sortie = path.join(racine, "frontend", "public", "demos");
const tmp = path.join(racine, "scripts", ".tmp-demos");

const dossierPw = process.env.PLAYWRIGHT_DIR || path.join(homedir(), "Desktop", "il-subito", "frontend");
const { chromium } = createRequire(path.join(dossierPw, "package.json"))("playwright");

// Un site par démo (la page Toulouse réutilise la démo du barbier : pas de doublon)
const DEMOS = [
  { slug: "ilsubito", url: "https://ilsubito.mandev.fr" },
  { slug: "cerclebarbier", url: "https://cerclebarbier.mandev.fr" },
  { slug: "restaurant", url: "https://restaurant.mandev.fr" },
  { slug: "boulangerie", url: "https://boulangerie.mandev.fr" },
  { slug: "plombier", url: "https://plombier.mandev.fr" },
  { slug: "garage", url: "https://garage.mandev.fr" },
];

const VIEWPORT = { width: 1440, height: 900 };
const TAILLE_VIDEO = { width: 960, height: 600 }; // réduite : les cartes du bandeau font ~350 px de large
const ATTENTE_HERO_MS = 3200; // le temps que les animations du héros se terminent
const PAUSE_FIN_MS = 1200;
const DUREE_HERO_S = 4.5; // mode --hero : durée de la vidéo, comptée depuis le premier affichage de contenu
const AVANT_CONTENU_S = 0; // on démarre à l'image où l'écran change : tout recul montrerait la page blanche d'avant le premier affichage (flash à chaque boucle)
const PAUSE_HERO_MS = 2500; // mode --hero : le héros reste affiché un instant après ses animations
const PX_PAR_SECONDE = 520;
const DUREE_MIN_MS = 4000;
const DUREE_MAX_MS = 11000;

// Masque le bandeau « site fictif » (trois variantes selon la démo) et annule le décalage qu'il impose à la navbar.
// Ajoute aussi un point de 2 px quasi transparent qui clignote dans un coin : Playwright n'écrit une image que si l'écran change,
// et sans lui la vidéo s'arrêterait dès la fin des animations du héros (impossible alors de garder le héros affiché ensuite).
const MASQUER_BANDEAU = `
  const css = '.demo, .demo-banner, .bandeau-demo { display: none !important; } :root { --demo-h: 0px !important; } '
    + '@keyframes pouls-enreg { from { opacity: 0.02; } to { opacity: 0.04; } } '
    + 'html::after { content: ""; position: fixed; right: 0; bottom: 0; width: 2px; height: 2px; background: #000; pointer-events: none; z-index: 2147483647; animation: pouls-enreg 0.08s steps(2) infinite; }';
  const poser = () => { const s = document.createElement('style'); s.textContent = css; document.documentElement.appendChild(s); };
  if (document.documentElement) poser(); else document.addEventListener('DOMContentLoaded', poser);
  document.addEventListener('DOMContentLoaded', () => { document.documentElement.classList.remove('has-demo-banner'); });
`;

async function defiler(page) {
  return page.evaluate(async ({ pxParSeconde, min, max }) => {
    document.documentElement.style.scrollBehavior = "auto";
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return 0;
    const duree = Math.min(max, Math.max(min, (total / pxParSeconde) * 1000));
    const debut = performance.now();
    const adoucir = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // départ et arrivée en douceur
    await new Promise((fin) => {
      const pas = (maintenant) => {
        const t = Math.min(1, (maintenant - debut) / duree);
        window.scrollTo(0, total * adoucir(t));
        if (t < 1) requestAnimationFrame(pas); else fin();
      };
      requestAnimationFrame(pas);
    });
    return total;
  }, { pxParSeconde: PX_PAR_SECONDE, min: DUREE_MIN_MS, max: DUREE_MAX_MS });
}

async function enregistrer(browser, demo, hero) {
  const dossier = path.join(tmp, demo.slug);
  rmSync(dossier, { recursive: true, force: true });
  mkdirSync(dossier, { recursive: true });

  const contexte = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    recordVideo: { dir: dossier, size: TAILLE_VIDEO },
  });
  await contexte.addInitScript(MASQUER_BANDEAU);
  const page = await contexte.newPage();
  const t0 = Date.now();

  const departNav = (Date.now() - t0) / 1000;
  await page.goto(demo.url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  // Premier affichage de contenu (FCP), dans le temps de la vidéo brute : la vidéo commencera juste avant. À défaut, l'événement load.
  const fcp = await page.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0);
  const debutHero = fcp > 0 ? departNav + fcp / 1000 : (Date.now() - t0) / 1000;
  await page.waitForTimeout(ATTENTE_HERO_MS);
  if (!hero) await page.screenshot({ path: path.join(dossier, "affiche.png"), type: "png" });
  const total = hero ? 0 : await defiler(page);
  await page.waitForTimeout(hero ? PAUSE_HERO_MS : PAUSE_FIN_MS);

  await contexte.close(); // finalise le fichier vidéo
  const brut = readdirSync(dossier).find((f) => f.endsWith(".webm"));
  console.log(`  ${demo.slug} : ${hero ? "héros seul" : `page de ${total}px`}, héros à ${debutHero.toFixed(1)} s`);
  return { dossier, brut: path.join(dossier, brut), debutHero };
}

// Coupe le chargement du début et recompresse avec le ffmpeg fourni par Playwright (version réduite : VP8 suffit)
function trouverFfmpeg() {
  const base = path.join(homedir(), "AppData", "Local", "ms-playwright");
  if (!existsSync(base)) return null;
  const d = readdirSync(base).filter((n) => n.startsWith("ffmpeg-")).sort().pop();
  if (!d) return null;
  for (const nom of ["ffmpeg-win64.exe", "ffmpeg.exe", "ffmpeg"]) {
    const p = path.join(base, d, nom);
    if (existsSync(p)) return p;
  }
  return null;
}

// Luminosité moyenne d'un PNG en niveaux de gris 8 bits (sortie de ffmpeg -pix_fmt gray), décodé ici : le ffmpeg de Playwright est
// une version réduite (pas de filtre de détection de scène), on repère donc nous-mêmes l'image où l'écran change.
function luminosite(png) {
  let pos = 8; let w = 0; let h = 0; let type = -1; const donnees = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    const nom = png.toString("ascii", pos + 4, pos + 8);
    const bloc = png.subarray(pos + 8, pos + 8 + len);
    if (nom === "IHDR") { w = bloc.readUInt32BE(0); h = bloc.readUInt32BE(4); type = bloc[9]; }
    if (nom === "IDAT") donnees.push(bloc);
    pos += 12 + len;
  }
  if (type !== 0) return null;
  const brut = inflateSync(Buffer.concat(donnees));
  const px = Buffer.alloc(w * h);
  let somme = 0;
  for (let y = 0; y < h; y++) {
    const filtre = brut[y * (w + 1)];
    for (let x = 0; x < w; x++) {
      const v = brut[y * (w + 1) + 1 + x];
      const a = x ? px[y * w + x - 1] : 0;
      const b = y ? px[(y - 1) * w + x] : 0;
      const c = x && y ? px[(y - 1) * w + x - 1] : 0;
      let r;
      if (filtre === 0) r = v;
      else if (filtre === 1) r = v + a;
      else if (filtre === 2) r = v + b;
      else if (filtre === 3) r = v + ((a + b) >> 1);
      else { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      px[y * w + x] = r & 255;
      somme += px[y * w + x];
    }
  }
  return somme / (w * h);
}

// Instant (en secondes) où l'écran cesse de ressembler à sa toute première image (page blanche avant le premier affichage), ou null
function premierChangement(ffmpeg, brut, dossier) {
  const analyse = path.join(dossier, "analyse");
  rmSync(analyse, { recursive: true, force: true });
  mkdirSync(analyse, { recursive: true });
  const r = spawnSync(ffmpeg, ["-y", "-i", brut, "-r", "10", "-vf", "scale=16:10", "-pix_fmt", "gray", path.join(analyse, "f%04d.png")], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const moyennes = readdirSync(analyse).sort().map((f) => luminosite(readFileSync(path.join(analyse, f))));
  if (moyennes.length < 2 || moyennes[0] === null) return null;
  const i = moyennes.findIndex((m) => m !== null && Math.abs(m - moyennes[0]) > 2.5);
  return i > 0 ? i / 10 : null;
}

function finaliser(demo, enr, ffmpeg, suffixe, hero) {
  const cible = path.join(sortie, `${demo.slug}${suffixe}.webm`);
  const premier = premierChangement(ffmpeg, enr.brut, enr.dossier);
  console.log(`  ${demo.slug} : premier changement d'écran à ${premier === null ? "?" : premier.toFixed(1) + " s"} (premier affichage mesuré : ${enr.debutHero.toFixed(1)} s)`);
  const debut = Math.max(0, (premier ?? enr.debutHero) - AVANT_CONTENU_S);
  const duree = hero ? ["-t", String(DUREE_HERO_S + AVANT_CONTENU_S)] : [];
  const r = spawnSync(ffmpeg, ["-y", "-ss", debut.toFixed(2), "-i", enr.brut, ...duree, "-c:v", "libvpx", "-b:v", "1100k", "-crf", "30", "-an", cible], { encoding: "utf8" });
  if (r.status !== 0) {
    console.warn(`  ffmpeg a échoué pour ${demo.slug}, vidéo brute conservée (début non coupé)`);
    renameSync(enr.brut, cible);
  }
  return cible;
}

mkdirSync(sortie, { recursive: true });
const hero = process.argv.includes("--hero");
const demandees = process.argv.slice(2).filter((a) => a !== "--hero");
const suffixe = hero ? "-hero" : "";
const liste = demandees.length ? DEMOS.filter((d) => demandees.includes(d.slug)) : DEMOS;
const ffmpeg = trouverFfmpeg();
if (!ffmpeg) console.warn("ffmpeg de Playwright introuvable : les vidéos garderont le temps de chargement au début.");

const browser = await chromium.launch();
try {
  for (const demo of liste) {
    console.log(`Enregistrement ${demo.slug}…`);
    const enr = await enregistrer(browser, demo, hero);
    if (ffmpeg) finaliser(demo, enr, ffmpeg, suffixe, hero);
    else renameSync(enr.brut, path.join(sortie, `${demo.slug}${suffixe}.webm`));
    if (!hero) renameSync(path.join(enr.dossier, "affiche.png"), path.join(tmp, `${demo.slug}-affiche.png`));
  }
} finally {
  await browser.close();
}
console.log(`Terminé : ${sortie}\nAffiches PNG brutes dans ${tmp} (à convertir en WebP).`);
