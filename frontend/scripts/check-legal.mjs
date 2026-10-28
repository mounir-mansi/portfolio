// Lancé avant `npm run build` : prévient si une information légale obligatoire manque.
// Avertissement seulement : le build n'est pas bloqué.
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/data/legal.js", import.meta.url), "utf8");
const missing = [];

if (/address:\s*""/.test(source)) {
  missing.push("l'adresse de l'éditeur (adresse professionnelle ou de domiciliation) dans src/data/legal.js");
}

if (missing.length > 0) {
  console.warn("\n\x1b[33m⚠ Mentions légales incomplètes : il manque " + missing.join(", ") + ".\x1b[0m\n");
}
