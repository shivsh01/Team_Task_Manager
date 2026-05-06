const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middlewares/authMiddleware");
const { requireProjectAdmin } = require("../middlewares/roleMiddleware");
const { validate, projectSchema } = require("../utils/validation");

router.use(protect);

router.post("/", validate(projectSchema), createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id/add-member", requireProjectAdmin, addMember);
router.delete("/:id/remove-member", requireProjectAdmin, removeMember);
router.delete("/:id", requireProjectAdmin, deleteProject);

module.exports = router;
