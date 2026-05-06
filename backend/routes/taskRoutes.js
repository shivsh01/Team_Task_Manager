const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");
const { validate, taskSchema, taskUpdateSchema } = require("../utils/validation");

router.use(protect);

router.post("/", validate(taskSchema), createTask);
router.get("/:projectId", getTasksByProject);
router.put("/:id", validate(taskUpdateSchema), updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
