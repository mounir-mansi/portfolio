require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const projects = [
  {
    id: 5,
    title: "Site Vitrine Restaurant & Bar",
    description: "Solution clé en main pour restaurants et commerces locaux. Panneau admin, galerie photos, formulaire de contact — fonctionnel dès le lancement et évolutif sur demande.",
    longDescription: "Site Vitrine Restaurant & Bar est une solution fullstack que je propose aux restaurants et commerces locaux souhaitant une présence web professionnelle.\n\nL'application inclut un panneau d'administration permettant de gérer les photos du site (hero, à propos, événements), la galerie, et les messages reçus via le formulaire de contact — avec possibilité de répondre directement par email.\n\nCe n'est pas un template figé : le projet est fonctionnel dès la livraison et pensé pour évoluer selon les besoins du client — modification des textes, connexion Instagram, réservations, menu en ligne, etc. Le tout sécurisé et déployé en production sur VPS avec Nginx et HTTPS.",
    highlights: ["Panneau admin CMS fonctionnel et évolutif : galerie, sections, messages","Upload photos vers Cloudflare R2 (S3-compatible)","Formulaire de contact avec réponse email via Resend","Authentification JWT en cookie httpOnly sécurisé","Déployé sur VPS avec Nginx + SSL Let's Encrypt","Score Lynis 85/100 — hardening VPS","Design responsive mobile-first"],
    stack: ["React","Node.js","Express","PostgreSQL","Prisma","Cloudflare R2","Resend","Nginx","VPS"],
    imageKey: null,
    imageUrl: "/main-vitrine.png",
    liveUrl: "https://demo.mandev.fr",
    githubUrl: null,
    featured: true,
    order: 1,
  },
  {
    id: 4,
    title: "Worksocial",
    description: "Projet d'équipe réalisé en formation développeur fullstack JS. Réseau social professionnel web + mobile avec chat temps réel, posts, événements et interface admin.",
    longDescription: "Worksocial est un projet de fin de formation fullstack JS, développé en équipe. L'objectif était de concevoir un réseau social professionnel complet, accessible depuis le web (React) et sur mobile (React Native / Expo) en partageant le même backend.\n\nFonctionnalités principales : inscription multi-étapes avec vérification email, profil utilisateur avec photo, posts avec images, chat privé en temps réel via WebSocket, actualités, événements, sondages, et interface d'administration.\n\nLes images sont stockées sur Cloudflare R2. L'authentification repose sur JWT en cookie httpOnly. Le tout est déployé sur VPS avec Nginx, PM2 et SSL — score Lynis 85/100.",
    highlights: ["Réalisé en formation développeur fullstack JS","Application mobile React Native (Expo) + web React — même backend","Chat privé en temps réel via WebSocket sécurisé par JWT","Inscription multi-étapes (5 étapes) avec vérification email","Profil utilisateur, posts avec images, actualités, événements, sondages","Upload images vers Cloudflare R2 (S3-compatible)","Authentification JWT en cookie httpOnly + Resend","Interface admin + back-office de modération","Déployé sur VPS Nginx + PM2 + SSL — Score Lynis 85/100"],
    stack: ["React","Node.js","Express","PostgreSQL","Prisma","Nginx","VPS"],
    imageKey: null,
    imageUrl: "/main-worksocial.png",
    liveUrl: "https://worksocial.mandev.fr",
    githubUrl: "https://github.com/mounir-mansi/Worksocial",
    featured: false,
    order: 2,
  },
  {
    id: 3,
    title: "QCM Quiz",
    description: "Application quiz interactif avec gestion des questions, scores et progression. Récemment utilisé pour s'entraîner pour le permis de navigation (Patentino) en Italie.",
    longDescription: "QCM Quiz est une application fullstack de révision par quiz interactif, initialement développée pendant ma formation puis adaptée pour aider un ami à préparer son permis de cariste italien (Patentino di muletto).\n\nL'app propose un système de quiz complet : sélection du module et du niveau de difficulté (facile / intermédiaire / difficile), timer de 45 secondes par question, surlignage des bonnes et mauvaises réponses, et un système anti-répétition des questions déjà vues.\n\nChaque utilisateur dispose d'un compte avec historique de ses scores. La session expire automatiquement après 30 minutes d'inactivité. Le tout est déployé sur VPS avec Nginx, PM2 et CrowdSec.",
    highlights: ["Quiz avec timer 45s par question et correction immédiate","3 niveaux de difficulté par module","Système anti-répétition des questions déjà vues","Historique des scores par utilisateur","Déconnexion automatique après 30 min d'inactivité","Authentification JWT + validation Zod sur toutes les routes","Déployé sur VPS — Nginx + PM2 + CrowdSec","Score Lynis 85/100 — hardening VPS"],
    stack: ["Next.js","TypeScript","Tailwind CSS","Node.js","Express","MySQL","Prisma","Zod","JWT","VPS"],
    imageKey: null,
    imageUrl: "/main-qcm.png",
    liveUrl: "https://qcm.mandev.fr",
    githubUrl: "https://github.com/mounir-mansi/QCM-Patentino",
    featured: false,
    order: 3,
  },
];

async function main() {
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    console.log(`Projet upsert : ${p.title}`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
