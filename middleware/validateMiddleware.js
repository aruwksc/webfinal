const Joi = require('joi');

const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  habit: Joi.object({
    name:        Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('').optional(),
    category:    Joi.string().valid('health','mind','work','social','creative','finance').optional(),
    frequency:   Joi.string().valid('daily','weekly','weekdays','weekends').optional(),
    target:      Joi.number().integer().min(1).max(100).optional(),
    color:       Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    reminder:    Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  }),

  profile: Joi.object({
    username:        Joi.string().alphanum().min(3).max(30).optional(),
    email:           Joi.string().email().optional(),
    firstName:       Joi.string().max(50).allow('').optional(),
    lastName:        Joi.string().max(50).allow('').optional(),
    bio:             Joi.string().max(300).allow('').optional(),
    currentPassword: Joi.string().optional(),
    newPassword:     Joi.string().min(6).optional(),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error } = schemas[schema].validate(req.body, { abortEarly: false });
  if (error) {
    const msgs = error.details.map(d => d.message).join(', ');
    return res.status(400).json({ message: msgs });
  }
  next();
};

module.exports = { validate };


