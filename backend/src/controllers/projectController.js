const prisma = require("../lib/prisma");
const { deleteS3Object } = require("../lib/deleteS3Object");

async function getProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function createProject(req, res) {
  const { title, description, stack, liveUrl, githubUrl, featured, order } = req.body;
  if (!title?.trim() || !description?.trim())
    return res.status(400).json({ error: "Titre et description requis" });

  const imageKey = req.file?.key || null;
  const imageUrl = imageKey
    ? `${process.env.R2_PUBLIC_URL}/${imageKey}`
    : null;

  try {
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        stack: Array.isArray(stack) ? stack : stack ? stack.split(",").map((s) => s.trim()) : [],
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
  const { title, description, stack, liveUrl, githubUrl, featured, order } = req.body;

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Projet introuvable" });

    let imageKey = existing.imageKey;
    let imageUrl = existing.imageUrl;

    if (req.file) {
      // Supprimer ancienne image si elle existe
      if (existing.imageKey) {
        await deleteS3Object(existing.imageKey).catch(console.error);
      }
      imageKey = req.file.key;
      imageUrl = `${process.env.R2_PUBLIC_URL}/${imageKey}`;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        description: description?.trim() || existing.description,
        stack: Array.isArray(stack) ? stack : stack ? stack.split(",").map((s) => s.trim()) : existing.stack,
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

    if (project.imageKey) {
      await deleteS3Object(project.imageKey).catch(console.error);
    }

    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject };
