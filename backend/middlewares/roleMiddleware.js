const Project = require("../models/Project");

const requireProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId || req.body.project;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Forbidden: Only project admin can perform this action",
    });
  }

  req.project = project;
  next();
};

const requireProjectMember = async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId || req.body.project;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = project.admin.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);

  if (!isAdmin && !isMember) {
    return res.status(403).json({
      message: "Forbidden: You are not a member of this project",
    });
  }

  req.project = project;
  req.isProjectAdmin = isAdmin;
  next();
};

module.exports = { requireProjectAdmin, requireProjectMember };
