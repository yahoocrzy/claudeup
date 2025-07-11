const Joi = require('joi');

// Environment variable validation
const validateEnv = () => {
  // Skip validation if explicitly disabled
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.log('Environment validation skipped');
    return;
  }

  const envSchema = Joi.object({
    CLAUDE_API_KEY: Joi.string().required().pattern(/^sk-ant-/),
    CLICKUP_API_TOKEN: Joi.string().required().pattern(/^pk_/),
    CLICKUP_WORKSPACE_ID: Joi.string().required(),
    CLICKUP_LIST_ID: Joi.string().required(),
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    API_KEY: Joi.string().min(32).when('NODE_ENV', {
      is: 'production',
      then: Joi.optional(), // Made optional for now
      otherwise: Joi.optional()
    }),
    WEBHOOK_SECRET: Joi.string().optional(),
    ALLOWED_ORIGINS: Joi.string().optional()
  }).unknown(true);

  const { error } = envSchema.validate(process.env);
  
  if (error) {
    console.error('Environment validation error:', error.details[0].message);
    console.error('Current environment variables:', {
      CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'Set (hidden)' : 'Not set',
      CLICKUP_API_TOKEN: process.env.CLICKUP_API_TOKEN ? 'Set (hidden)' : 'Not set',
      CLICKUP_WORKSPACE_ID: process.env.CLICKUP_WORKSPACE_ID || 'Not set',
      CLICKUP_LIST_ID: process.env.CLICKUP_LIST_ID || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    });
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