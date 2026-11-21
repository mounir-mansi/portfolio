// Textes des articles du blog : fichiers Markdown de src/content/blog, chargés avec l'application
// (nécessaire pour le prérendu, qui fabrique le HTML complet de chaque article sans attendre le réseau).
import { compterMots } from "./markdown";

const fichiers = import.meta.glob("../content/blog/*.md", { query: "?raw", import: "default", eager: true });

export const corpsArticle = (slug) => fichiers[`../content/blog/${slug}.md`] ?? null;

// Temps de lecture arrondi (environ 200 mots par minute)
export const minutesLecture = (slug) => Math.max(1, Math.round(compterMots(corpsArticle(slug) || "") / 200));
