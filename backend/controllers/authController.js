const User = require("../models/User");
const { generateToken, clearToken } = require("../utils/generateToken");

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(res, user._id);

  res.status(201).json({
    message: "Account created successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(res, user._id);

  res.json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const logout = async (req, res) => {
  clearToken(res);
  res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("projects", "title description");
  res.json({ user });
};

module.exports = { signup, login, logout, getMe };
