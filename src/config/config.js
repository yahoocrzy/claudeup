require('dotenv').config();

const config = {
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    apiUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096
  },
  clickup: {
    apiToken: process.env.CLICKUP_API_TOKEN,
    apiUrl: 'https://api.clickup.com/api/v2',
    workspaceId: process.env.CLICKUP_WORKSPACE_ID,
    defaultListId: process.env.CLICKUP_LIST_ID
  },
  server: {
    port: process.env.PORT || 3000
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET
  },
  apiKey: process.env.API_KEY
};

module.exports = config;