// Remplace l'ancienne photo d'Il Subito (main-ilsubito.png) par la capture du site (main-ilsubito.webp).
// Ciblé et rejouable : ne touche que les projets dont imageUrl vaut EXACTEMENT l'ancienne valeur.
// Le seed (seed-projects.js) n'est pas rejoué en production : il réécrirait tout le contenu des projets.
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  const r = await prisma.project.updateMany({
    where: { imageUrl: "/main-ilsubito.png" },
    data: { imageUrl: "/main-ilsubito.webp" },
  });
  console.log(r.count ? `[OK] ${r.count} projet(s) mis à jour : /main-ilsubito.webp` : "[OK] rien à changer (déjà à jour ou image différente)");
})()
  .catch((e) => { console.error("[ECHEC]", e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
