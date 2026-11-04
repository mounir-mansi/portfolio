// Enregistre une courte vidéo de l'accueil de chaque site de démonstration, pour le bandeau du portfolio (DemoStrip).
// Chaque vidéo : le héros s'anime, une pause, puis défilement doux jusqu'en bas de l'accueil. Le bandeau « site fictif »
// des démos est masqué (il reste visible pour les vrais visiteurs, seule la vidéo est nettoyée).
//
// Usage : node scripts/enregistrer-demos.mjs [slug ...]      (sans argument : toutes les démos)
// Sortie : frontend/public/demos/<slug>.webm  +  <slug>.webp (affiche, image du héros)
//
// Playwright n'est pas une dépendance du portfolio : on réutilise celui d'un autre projet de la machine.
// Autre emplacement : PLAYWRIGHT_DIR=<dossier contenant node_modules/playwright>.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, existsSync } from "node:fs";
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
const PX_PAR_SECONDE = 520;
const DUREE_MIN_MS = 4000;
const DUREE_MAX_MS = 11000;

// Masque le bandeau « site fictif » (trois variantes selon la démo) et annule le décalage qu'il impose à la navbar
const MASQUER_BANDEAU = `
  const css = '.demo, .demo-banner, .bandeau-demo { display: none !important; } :root { --demo-h: 0px !important; }';
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

async function enregistrer(browser, demo) {
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

  await page.goto(demo.url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  const debutHero = (Date.now() - t0) / 1000; // la vidéo brute commence ici : on coupera avant ce point
  await page.waitForTimeout(ATTENTE_HERO_MS);
  await page.screenshot({ path: path.join(dossier, "affiche.png"), type: "png" });
  const total = await defiler(page);
  await page.waitForTimeout(PAUSE_FIN_MS);

  await contexte.close(); // finalise le fichier vidéo
  const brut = readdirSync(dossier).find((f) => f.endsWith(".webm"));
  console.log(`  ${demo.slug} : page de ${total}px, héros à ${debutHero.toFixed(1)} s`);
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

function finaliser(demo, enr, ffmpeg) {
  const cible = path.join(sortie, `${demo.slug}.webm`);
  const debut = Math.max(0, enr.debutHero - 0.15);
  const r = spawnSync(ffmpeg, ["-y", "-ss", debut.toFixed(2), "-i", enr.brut, "-c:v", "libvpx", "-b:v", "1100k", "-crf", "30", "-an", cible], { encoding: "utf8" });
  if (r.status !== 0) {
    console.warn(`  ffmpeg a échoué pour ${demo.slug}, vidéo brute conservée (début non coupé)`);
    renameSync(enr.brut, cible);
  }
  return cible;
}

mkdirSync(sortie, { recursive: true });
const demandees = process.argv.slice(2);
const liste = demandees.length ? DEMOS.filter((d) => demandees.includes(d.slug)) : DEMOS;
const ffmpeg = trouverFfmpeg();
if (!ffmpeg) console.warn("ffmpeg de Playwright introuvable : les vidéos garderont le temps de chargement au début.");

const browser = await chromium.launch();
try {
  for (const demo of liste) {
    console.log(`Enregistrement ${demo.slug}…`);
    const enr = await enregistrer(browser, demo);
    if (ffmpeg) finaliser(demo, enr, ffmpeg);
    else renameSync(enr.brut, path.join(sortie, `${demo.slug}.webm`));
    renameSync(path.join(enr.dossier, "affiche.png"), path.join(tmp, `${demo.slug}-affiche.png`));
  }
} finally {
  await browser.close();
}
console.log(`Terminé : ${sortie}\nAffiches PNG brutes dans ${tmp} (à convertir en WebP).`);
