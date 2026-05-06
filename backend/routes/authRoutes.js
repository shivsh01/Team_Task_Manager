const express = require("express");
const router = express.Router();
const { signup, login, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { validate, signupSchema, loginSchema } = require("../utils/validation");

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
