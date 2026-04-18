require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const projects = [
  {
    id: 6,
    title: "Il Subito — Commande & Paiement en ligne",
    description: "Application fullstack de commande en ligne pour un kebab-pizzeria à Turin. Menu interactif, panier, paiement Stripe, comptes clients, interface admin complète.",
    longDescription: "Il Subito est une application web fullstack développée pour un restaurant kebab-pizzeria à Turin (Italie).\n\nLes clients peuvent parcourir le menu interactif, composer leur panier, créer un compte ou commander en tant qu'invité, puis payer en ligne via Stripe. Un système de statuts de commande en temps réel informe le client à chaque étape.\n\nL'interface admin permet au restaurateur de gérer le menu (plats, prix, disponibilité, options), les commandes en cours, la galerie, les événements et les messages de contact. L'authentification est sécurisée via JWT httpOnly et Google OAuth. Le site est déployé sur VPS avec Nginx, PM2 et SSL.",
    highlights: [
      "Commande en ligne avec panier et paiement Stripe (cartes, remboursement automatique)",
      "Comptes clients avec authentification Google OAuth + JWT httpOnly",
      "Commande invité via numéro de téléphone — sans inscription",
      "Interface admin complète : menu, commandes, galerie, événements, messages",
      "Statuts de commande en temps réel avec notifications email (Brevo)",
      "Horaires d'ouverture dynamiques — menu bloqué hors horaires",
      "Tests end-to-end Playwright : 7 scénarios complets (paiement, annulation, remboursement)",
      "Déployé sur VPS — Nginx + PM2 + SSL"
    ],
    highlights_en: [
      "Online ordering with cart and Stripe payment (cards, automatic refund)",
      "Customer accounts with Google OAuth + JWT httpOnly authentication",
      "Guest ordering via phone number — no registration required",
      "Full admin panel: menu, orders, gallery, events, messages",
      "Real-time order status with email notifications (Brevo)",
      "Dynamic opening hours — menu blocked outside business hours",
      "Playwright end-to-end tests: 7 complete scenarios (payment, cancellation, refund)",
      "Deployed on VPS — Nginx + PM2 + SSL"
    ],
    highlights_it: [
      "Ordine online con carrello e pagamento Stripe (carte, rimborso automatico)",
      "Account clienti con autenticazione Google OAuth + JWT httpOnly",
      "Ordine ospite tramite numero di telefono — senza registrazione",
      "Pannello admin completo: menu, ordini, galleria, eventi, messaggi",
      "Stato ordini in tempo reale con notifiche email (Brevo)",
      "Orari di apertura dinamici — menu bloccato fuori dagli orari",
      "Test end-to-end Playwright: 7 scenari completi (pagamento, cancellazione, rimborso)",
      "Distribuito su VPS — Nginx + PM2 + SSL"
    ],
    highlights_es: [
      "Pedido online con carrito y pago Stripe (tarjetas, reembolso automático)",
      "Cuentas de cliente con autenticación Google OAuth + JWT httpOnly",
      "Pedido de invitado por número de teléfono — sin registro",
      "Panel admin completo: menú, pedidos, galería, eventos, mensajes",
      "Estado de pedidos en tiempo real con notificaciones por email (Brevo)",
      "Horarios de apertura dinámicos — menú bloqueado fuera del horario",
      "Tests end-to-end Playwright: 7 escenarios completos (pago, cancelación, reembolso)",
      "Desplegado en VPS — Nginx + PM2 + SSL"
    ],
    title_en: "Il Subito — Online Ordering & Payment",
    title_it: "Il Subito — Ordine e Pagamento Online",
    title_es: "Il Subito — Pedidos y Pago Online",
    description_en: "Fullstack online ordering application for a kebab-pizzeria in Turin. Interactive menu, cart, Stripe payment, customer accounts, complete admin panel.",
    description_it: "Applicazione web fullstack per gli ordini online di un kebab-pizzeria a Torino. Menu interattivo, carrello, pagamento Stripe, account clienti, pannello admin completo.",
    description_es: "Aplicación web fullstack de pedidos online para un kebab-pizzería en Turín. Menú interactivo, carrito, pago Stripe, cuentas de cliente, panel admin completo.",
    longDescription_en: "Il Subito is a fullstack web application developed for a kebab-pizzeria in Turin (Italy).\n\nCustomers can browse the interactive menu, build their cart, create an account or order as a guest, then pay online via Stripe. A real-time order status system keeps the customer informed at every step.\n\nThe admin panel lets the restaurant owner manage the menu (dishes, prices, availability, options), current orders, gallery, events and contact messages. Authentication is secured via JWT httpOnly and Google OAuth. The site is deployed on a VPS with Nginx, PM2 and SSL.",
    longDescription_it: "Il Subito è un'applicazione web fullstack sviluppata per un kebab-pizzeria a Torino (Italia).\n\nI clienti possono sfogliare il menu interattivo, riempire il carrello, creare un account o ordinare come ospite, poi pagare online tramite Stripe. Un sistema di stati ordine in tempo reale tiene informato il cliente a ogni passaggio.\n\nIl pannello admin permette al ristoratore di gestire il menu (piatti, prezzi, disponibilità, opzioni), gli ordini in corso, la galleria, gli eventi e i messaggi di contatto. L'autenticazione è protetta via JWT httpOnly e Google OAuth. Il sito è distribuito su VPS con Nginx, PM2 e SSL.",
    longDescription_es: "Il Subito es una aplicación web fullstack desarrollada para un kebab-pizzería en Turín (Italia).\n\nLos clientes pueden explorar el menú interactivo, llenar su carrito, crear una cuenta u ordenar como invitado, y luego pagar en línea con Stripe. Un sistema de estados de pedido en tiempo real mantiene al cliente informado en cada paso.\n\nEl panel admin permite al restaurador gestionar el menú (platos, precios, disponibilidad, opciones), los pedidos en curso, la galería, eventos y mensajes de contacto. La autenticación está asegurada con JWT httpOnly y Google OAuth. El sitio está desplegado en VPS con Nginx, PM2 y SSL.",
    stack: ["React","Node.js","Express","PostgreSQL","Prisma","Stripe","Brevo","Google OAuth","Playwright","Nginx","VPS"],
    imageKey: null,
    imageUrl: "/main-ilsubito.png",
    liveUrl: "https://ilsubito.mandev.fr",
    githubUrl: null,
    featured: true,
    order: 0,
  },
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
    const { id, ...data } = p;
    await prisma.project.upsert({
      where: { id },
      update: data,
      create: data,
    });
    console.log(`Projet upsert : ${p.title}`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
