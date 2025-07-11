const Joi = require('joi');

// Environment variable validation
const validateEnv = () => {
  const envSchema = Joi.object({
    CLAUDE_API_KEY: Joi.string().required().pattern(/^sk-ant-/),
    CLICKUP_API_TOKEN: Joi.string().required().pattern(/^pk_/),
    CLICKUP_WORKSPACE_ID: Joi.string().required(),
    CLICKUP_LIST_ID: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    API_KEY: Joi.string().min(32).when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    WEBHOOK_SECRET: Joi.string().optional(),
    ALLOWED_ORIGINS: Joi.string().optional()
  }).unknown(true);

  const { error } = envSchema.validate(process.env);
  
  if (error) {
    console.error('Environment validation error:', error.details[0].message);
    process.exit(1);
  }
};

// Request validation schemas
const schemas = {
  claudeToClickUp: Joi.object({
    prompt: Joi.string().required().min(1).max(5000),
    listId: Joi.string().optional(),
    taskId: Joi.string().optional()
  }),

  clickUpToClaude: Joi.object({
    taskId: Joi.string().required(),
    action: Joi.string().valid('analyze', 'summarize', 'generate_description').optional()
  }),

  webhook: Joi.object({
    event: Joi.string().required(),
    task_id: Joi.string().optional(),
    history_items: Joi.array().optional()
  })
};

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schemas[schema].validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validateEnv,
  validateRequest
};