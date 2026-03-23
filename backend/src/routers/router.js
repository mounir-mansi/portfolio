const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");
const { upload, uploadFixed } = require("../middleware/handleUpload");

const { login, logout, me } = require("../controllers/authController");
const { submitContact, getMessages, markRead, deleteMessage, replyMessage } = require("../controllers/contactController");
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require("../controllers/projectController");
const { getSkills, createSkill, updateSkill, deleteSkill } = require("../controllers/skillController");
const { getSections, uploadSection } = require("../controllers/sectionController");

// Auth
router.post("/login", login);
router.get("/logout", logout);
router.get("/admin/me", verifyToken, me);

// Contact
router.post("/contact", submitContact);
router.get("/admin/messages", verifyToken, getMessages);
router.patch("/admin/messages/:id/read", verifyToken, markRead);
router.delete("/admin/messages/:id", verifyToken, deleteMessage);
router.post("/admin/messages/:id/reply", verifyToken, replyMessage);

// Projets
router.get("/api/projects", getProjects);
router.get("/api/projects/:id", getProjectById);
router.post("/admin/projects", verifyToken, upload("projects").single("image"), createProject);
router.put("/admin/projects/:id", verifyToken, upload("projects").single("image"), updateProject);
router.delete("/admin/projects/:id", verifyToken, deleteProject);

// Skills
router.get("/api/skills", getSkills);
router.post("/admin/skills", verifyToken, createSkill);
router.put("/admin/skills/:id", verifyToken, updateSkill);
router.delete("/admin/skills/:id", verifyToken, deleteSkill);

// Sections
router.get("/api/sections", getSections);
router.post("/admin/sections/:slot", verifyToken, (req, res, next) => {
  uploadFixed(`sections/${req.params.slot}`)(req, res, next);
}, uploadSection);

module.exports = router;
