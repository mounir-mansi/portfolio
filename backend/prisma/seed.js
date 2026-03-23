require("dotenv").config();
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD manquant dans .env");

  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 5,
    parallelism: 1,
  });

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: hash },
    create: { username: "admin", password: hash },
  });

  console.log("Admin créé/mis à jour :", admin.username);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
