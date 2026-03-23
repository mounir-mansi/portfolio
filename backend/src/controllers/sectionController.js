const prisma = require("../lib/prisma");
const { deleteS3Object } = require("../lib/deleteS3Object");

const ALLOWED_SLOTS = ["hero", "about"];

async function getSections(req, res) {
  try {
    const sections = await prisma.section.findMany();
    // Retourner un objet indexé par slot
    const result = {};
    for (const s of sections) {
      result[s.slot] = { imageUrl: s.imageUrl, text: s.text };
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function uploadSection(req, res) {
  const { slot } = req.params;
  if (!ALLOWED_SLOTS.includes(slot))
    return res.status(400).json({ error: "Slot invalide" });

  try {
    const existing = await prisma.section.findUnique({ where: { slot } });

    // Supprimer ancienne image R2
    if (existing?.imageKey && req.file) {
      await deleteS3Object(existing.imageKey).catch(console.error);
    }

    const imageKey = req.file?.key || existing?.imageKey || null;
    const imageUrl = imageKey
      ? `${process.env.R2_PUBLIC_URL}/${imageKey}`
      : existing?.imageUrl || null;

    const text = req.body.text !== undefined ? req.body.text : existing?.text || null;

    const section = await prisma.section.upsert({
      where: { slot },
      update: { imageKey, imageUrl, text },
      create: { slot, imageKey, imageUrl, text },
    });

    res.json(section);
  } catch (err) {
    console.error("uploadSection error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getSections, uploadSection };
