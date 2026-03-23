const prisma = require("../lib/prisma");

async function getSkills(req, res) {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    res.json(skills);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createSkill(req, res) {
  const { name, category, icon, order } = req.body;
  if (!name?.trim() || !category?.trim())
    return res.status(400).json({ error: "Nom et catégorie requis" });

  try {
    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        icon: icon?.trim() || null,
        order: Number(order) || 0,
      },
    });
    res.status(201).json(skill);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateSkill(req, res) {
  const id = Number(req.params.id);
  const { name, category, icon, order } = req.body;
  try {
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        name: name?.trim(),
        category: category?.trim(),
        icon: icon?.trim() || null,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    res.json(skill);
  } catch {
    res.status(404).json({ error: "Skill introuvable" });
  }
}

async function deleteSkill(req, res) {
  try {
    await prisma.skill.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Skill introuvable" });
  }
}

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };
