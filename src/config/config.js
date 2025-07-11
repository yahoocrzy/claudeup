// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    apiUrl: 'https://api.anthropic.com/v1',
    model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 4096
  },
  clickup: {
    apiToken: process.env.CLICKUP_API_TOKEN,
    apiUrl: 'https://api.clickup.com/api/v2',
    workspaceId: process.env.CLICKUP_WORKSPACE_ID,
    defaultListId: process.env.CLICKUP_LIST_ID
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  security: {
    apiKey: process.env.API_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET
  }
};

module.exports = config;