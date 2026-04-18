const prisma = require("../lib/prisma");
const { deleteS3Object } = require("../lib/deleteS3Object");

const LANGS = ["fr", "en", "it", "es"];

function parseStack(stack, fallback = []) {
  if (Array.isArray(stack)) return stack;
  if (stack) return stack.split(",").map((s) => s.trim()).filter(Boolean);
  return fallback;
}

function parseHighlights(highlights, fallback = []) {
  if (Array.isArray(highlights)) return highlights;
  if (highlights) return highlights.split("\n").map((s) => s.trim()).filter(Boolean);
  return fallback;
}

// Applique la traduction d'un projet selon la langue demandée (fallback FR)
function applyLang(project, lang) {
  if (!lang || lang === "fr" || !LANGS.includes(lang)) return project;
  return {
    ...project,
    title: project[`title_${lang}`] || project.title,
    description: project[`description_${lang}`] || project.description,
    longDescription: project[`longDescription_${lang}`] || project.longDescription,
    highlights: project[`highlights_${lang}`]?.length ? project[`highlights_${lang}`] : project.highlights,
  };
}

async function getProjects(req, res) {
  const lang = req.query.lang;
  try {
    const projects = await prisma.project.findMany({
      where: { visible: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json(projects.map((p) => applyLang(p, lang)));
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getAllProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function toggleVisible(req, res) {
  const id = Number(req.params.id);
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Projet introuvable" });
    const updated = await prisma.project.update({
      where: { id },
      data: { visible: !project.visible },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getProjectById(req, res) {
  const id = Number(req.params.id);
  const lang = req.query.lang;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Projet introuvable" });
    res.json(applyLang(project, lang));
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createProject(req, res) {
  const {
    title, description, longDescription, highlights, stack, liveUrl, githubUrl, featured, order,
    title_en, title_it, title_es,
    description_en, description_it, description_es,
    longDescription_en, longDescription_it, longDescription_es,
    highlights_en, highlights_it, highlights_es,
  } = req.body;

  if (!title?.trim() || !description?.trim())
    return res.status(400).json({ error: "Titre et description requis" });

  const imageKey = req.file?.key || null;
  const imageUrl = imageKey ? `${process.env.R2_PUBLIC_URL}/${imageKey}` : null;

  try {
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        title_en: title_en?.trim() || null,
        title_it: title_it?.trim() || null,
        title_es: title_es?.trim() || null,
        description: description.trim(),
        description_en: description_en?.trim() || null,
        description_it: description_it?.trim() || null,
        description_es: description_es?.trim() || null,
        longDescription: longDescription?.trim() || null,
        longDescription_en: longDescription_en?.trim() || null,
        longDescription_it: longDescription_it?.trim() || null,
        longDescription_es: longDescription_es?.trim() || null,
        highlights: parseHighlights(highlights),
        highlights_en: parseHighlights(highlights_en),
        highlights_it: parseHighlights(highlights_it),
        highlights_es: parseHighlights(highlights_es),
        stack: parseStack(stack),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured: featured === "true" || featured === true,
        order: Number(order) || 0,
        imageKey,
        imageUrl,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateProject(req, res) {
  const id = Number(req.params.id);
  const {
    title, description, longDescription, highlights, stack, liveUrl, githubUrl, featured, order,
    title_en, title_it, title_es,
    description_en, description_it, description_es,
    longDescription_en, longDescription_it, longDescription_es,
    highlights_en, highlights_it, highlights_es,
  } = req.body;

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Projet introuvable" });

    let imageKey = existing.imageKey;
    let imageUrl = existing.imageUrl;

    if (req.file) {
      if (existing.imageKey) await deleteS3Object(existing.imageKey).catch(console.error);
      imageKey = req.file.key;
      imageUrl = `${process.env.R2_PUBLIC_URL}/${imageKey}`;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        title_en: title_en !== undefined ? title_en?.trim() || null : existing.title_en,
        title_it: title_it !== undefined ? title_it?.trim() || null : existing.title_it,
        title_es: title_es !== undefined ? title_es?.trim() || null : existing.title_es,
        description: description?.trim() || existing.description,
        description_en: description_en !== undefined ? description_en?.trim() || null : existing.description_en,
        description_it: description_it !== undefined ? description_it?.trim() || null : existing.description_it,
        description_es: description_es !== undefined ? description_es?.trim() || null : existing.description_es,
        longDescription: longDescription !== undefined ? longDescription?.trim() || null : existing.longDescription,
        longDescription_en: longDescription_en !== undefined ? longDescription_en?.trim() || null : existing.longDescription_en,
        longDescription_it: longDescription_it !== undefined ? longDescription_it?.trim() || null : existing.longDescription_it,
        longDescription_es: longDescription_es !== undefined ? longDescription_es?.trim() || null : existing.longDescription_es,
        highlights: highlights !== undefined ? parseHighlights(highlights) : existing.highlights,
        highlights_en: highlights_en !== undefined ? parseHighlights(highlights_en) : existing.highlights_en,
        highlights_it: highlights_it !== undefined ? parseHighlights(highlights_it) : existing.highlights_it,
        highlights_es: highlights_es !== undefined ? parseHighlights(highlights_es) : existing.highlights_es,
        stack: stack !== undefined ? parseStack(stack, existing.stack) : existing.stack,
        liveUrl: liveUrl ?? existing.liveUrl,
        githubUrl: githubUrl ?? existing.githubUrl,
        featured: featured !== undefined ? featured === "true" || featured === true : existing.featured,
        order: order !== undefined ? Number(order) : existing.order,
        imageKey,
        imageUrl,
      },
    });
    res.json(project);
  } catch (err) {
    console.error("updateProject error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteProject(req, res) {
  const id = Number(req.params.id);
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Projet introuvable" });
    if (project.imageKey) await deleteS3Object(project.imageKey).catch(console.error);
    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getProjects, getAllProjects, getProjectById, createProject, updateProject, deleteProject, toggleVisible };
