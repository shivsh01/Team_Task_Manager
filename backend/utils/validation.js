const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required(),
});

const projectSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().max(500).allow("").trim(),
});

const taskSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().max(1000).allow("").trim(),
  dueDate: Joi.date().required(),
  priority: Joi.string().valid("Low", "Medium", "High").default("Medium"),
  status: Joi.string().valid("To Do", "In Progress", "Done").default("To Do"),
  assignedTo: Joi.string().required(),
  project: Joi.string().required(),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(100).trim(),
  description: Joi.string().max(1000).allow("").trim(),
  dueDate: Joi.date(),
  priority: Joi.string().valid("Low", "Medium", "High"),
  status: Joi.string().valid("To Do", "In Progress", "Done"),
  assignedTo: Joi.string(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(422).json({ message });
  }
  next();
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  projectSchema,
  taskSchema,
  taskUpdateSchema,
};
