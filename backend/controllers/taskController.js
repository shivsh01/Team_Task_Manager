const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res) => {
  const { title, description, dueDate, priority, status, assignedTo, project } =
    req.body;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = projectDoc.admin.toString() === userId;

  if (!isAdmin) {
    return res
      .status(403)
      .json({ message: "Only project admin can create tasks" });
  }

  const isMemberOrAdmin =
    isAdmin ||
    projectDoc.members.some((m) => m.toString() === assignedTo);

  if (!isMemberOrAdmin) {
    return res
      .status(400)
      .json({ message: "Assigned user is not a project member" });
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    priority: priority || "Medium",
    status: status || "To Do",
    assignedTo,
    project,
    createdBy: req.user._id,
  });

  await Project.findByIdAndUpdate(project, {
    $addToSet: { tasks: task._id },
  });

  const populated = await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
  ]);

  res.status(201).json({ message: "Task created", task: populated });
};

const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = project.admin.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);

  if (!isAdmin && !isMember) {
    return res.status(403).json({ message: "Access denied" });
  }

  const filter = { project: projectId };

  if (!isAdmin) {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ tasks });
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findById(task.project);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = project.admin.toString() === userId;
  const isAssignee = task.assignedTo.toString() === userId;

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!isAdmin) {
    const allowedFields = ["status"];
    const attemptedFields = Object.keys(req.body);
    const forbidden = attemptedFields.filter((f) => !allowedFields.includes(f));
    if (forbidden.length > 0) {
      return res.status(403).json({
        message: `Members can only update task status. Forbidden fields: ${forbidden.join(", ")}`,
      });
    }
  }

  const updates = isAdmin
    ? req.body
    : { status: req.body.status };

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
  ]);

  res.json({ message: "Task updated", task: updatedTask });
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findById(task.project);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const isAdmin = project.admin.toString() === req.user._id.toString();
  if (!isAdmin) {
    return res
      .status(403)
      .json({ message: "Only project admin can delete tasks" });
  }

  await Project.findByIdAndUpdate(task.project, {
    $pull: { tasks: task._id },
  });

  await task.deleteOne();

  res.json({ message: "Task deleted successfully" });
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };
