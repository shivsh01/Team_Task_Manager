const Task = require("../models/Task");
const Project = require("../models/Project");

const getDashboard = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate(
    "members",
    "name email"
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userId = req.user._id.toString();
  const isAdmin = project.admin.toString() === userId;
  const isMember = project.members.some((m) => m._id.toString() === userId);

  if (!isAdmin && !isMember) {
    return res.status(403).json({ message: "Access denied" });
  }

  const now = new Date();

  const [totalTasks, tasksByStatus, overdueTasks, tasksByUser] =
    await Promise.all([
      Task.countDocuments({ project: projectId }),

      Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Task.countDocuments({
        project: projectId,
        dueDate: { $lt: now },
        status: { $ne: "Done" },
      }),

      Task.aggregate([
        { $match: { project: project._id } },
        {
          $group: {
            _id: "$assignedTo",
            total: { $sum: 1 },
            todo: {
              $sum: { $cond: [{ $eq: ["$status", "To Do"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
            },
            done: {
              $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$user.name",
            email: "$user.email",
            total: 1,
            todo: 1,
            inProgress: 1,
            done: 1,
          },
        },
      ]),
    ]);

  const statusMap = { "To Do": 0, "In Progress": 0, Done: 0 };
  tasksByStatus.forEach(({ _id, count }) => {
    statusMap[_id] = count;
  });

  res.json({
    totalTasks,
    tasksByStatus: statusMap,
    overdueTasks,
    tasksByUser,
    project: {
      _id: project._id,
      title: project.title,
      members: project.members,
    },
  });
};

module.exports = { getDashboard };
