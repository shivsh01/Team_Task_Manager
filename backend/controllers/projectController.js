const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const createProject = async (req, res) => {
  const { title, description } = req.body;

  const project = await Project.create({
    title,
    description,
    admin: req.user._id,
    members: [req.user._id],
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { projects: project._id },
  });

  const populated = await project.populate("admin", "name email");

  res.status(201).json({ message: "Project created", project: populated });
};

const getProjects = async (req, res) => {
  const userId = req.user._id;

  const projects = await Project.find({
    $or: [{ admin: userId }, { members: userId }],
  })
    .populate("admin", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });

  res.json({ projects });
};

const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("admin", "name email")
    .populate("members", "name email")
    .populate({
      path: "tasks",
      populate: [
        { path: "assignedTo", select: "name email" },
        { path: "createdBy", select: "name email" },
      ],
    });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = project.admin._id.toString() === userId;
  const isMember = project.members.some((m) => m._id.toString() === userId);

  if (!isAdmin && !isMember) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ project, isAdmin });
};

const addMember = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Member email is required" });
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    return res.status(404).json({ message: "User with that email not found" });
  }

  const project = req.project;

  const alreadyMember = project.members.some(
    (m) => m.toString() === userToAdd._id.toString()
  );

  if (alreadyMember) {
    return res.status(409).json({ message: "User is already a member" });
  }

  project.members.push(userToAdd._id);
  await project.save();

  await User.findByIdAndUpdate(userToAdd._id, {
    $addToSet: { projects: project._id },
  });

  await project.populate("members", "name email");

  res.json({ message: "Member added successfully", members: project.members });
};

const removeMember = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const project = req.project;

  if (project.admin.toString() === userId) {
    return res.status(400).json({ message: "Cannot remove the project admin" });
  }

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();

  await User.findByIdAndUpdate(userId, {
    $pull: { projects: project._id },
  });

  await Task.updateMany(
    { project: project._id, assignedTo: userId },
    { assignedTo: project.admin }
  );

  res.json({ message: "Member removed successfully" });
};

const deleteProject = async (req, res) => {
  const project = req.project;

  await Task.deleteMany({ project: project._id });

  await User.updateMany(
    { projects: project._id },
    { $pull: { projects: project._id } }
  );

  await project.deleteOne();

  res.json({ message: "Project deleted successfully" });
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
};
