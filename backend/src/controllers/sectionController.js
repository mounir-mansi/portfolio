const prisma = require("../lib/prisma");
const { deleteS3Object } = require("../lib/deleteS3Object");

const ALLOWED_SLOTS = ["hero", "about"];
const LANGS = ["fr", "en", "it", "es"];

// Applique la traduction d'une section selon la langue demandée (fallback FR)
function applyLang(section, lang) {
  if (!lang || lang === "fr" || !LANGS.includes(lang)) return section;
  return {
    ...section,
    text: section[`text_${lang}`] || section.text,
  };
}

async function getSections(req, res) {
  const lang = req.query.lang;
  try {
    const sections = await prisma.section.findMany();
    const result = {};
    for (const s of sections) {
      const translated = applyLang(s, lang);
      result[s.slot] = { imageUrl: translated.imageUrl, text: translated.text };
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

    if (existing?.imageKey && req.file) {
      await deleteS3Object(existing.imageKey).catch(console.error);
    }

    const imageKey = req.file?.key || existing?.imageKey || null;
    const imageUrl = imageKey
      ? `${process.env.R2_PUBLIC_URL}/${imageKey}`
      : existing?.imageUrl || null;

    const text = req.body.text !== undefined ? req.body.text || null : existing?.text || null;
    const text_en = req.body.text_en !== undefined ? req.body.text_en || null : existing?.text_en || null;
    const text_it = req.body.text_it !== undefined ? req.body.text_it || null : existing?.text_it || null;
    const text_es = req.body.text_es !== undefined ? req.body.text_es || null : existing?.text_es || null;

    const section = await prisma.section.upsert({
      where: { slot },
      update: { imageKey, imageUrl, text, text_en, text_it, text_es },
      create: { slot, imageKey, imageUrl, text, text_en, text_it, text_es },
    });

    res.json(section);
  } catch (err) {
    console.error("uploadSection error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getSections, uploadSection };
