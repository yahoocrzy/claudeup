# Claude-ClickUp Integration API

This API integrates Claude AI with ClickUp, allowing you to leverage AI capabilities for task management, analysis, and automation.

## Features

- **Claude to ClickUp**: Send prompts to Claude and create tasks or add comments in ClickUp
- **ClickUp to Claude**: Analyze tasks, generate descriptions, and get AI insights
- **Webhook Support**: Automatically process ClickUp events with Claude AI
- **Task Analysis**: Get AI-powered insights on task complexity, time estimates, and dependencies
- **Task Generation**: Create detailed task descriptions from brief inputs

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Claude API key from Anthropic
- ClickUp API token

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and add your API credentials:
   ```env
   # Claude AI Configuration
   CLAUDE_API_KEY=sk-ant-api03-...
   
   # ClickUp Configuration
   CLICKUP_API_TOKEN=pk_...
   CLICKUP_WORKSPACE_ID=90...
   CLICKUP_LIST_ID=90...
   
   # Server Configuration
   PORT=3000
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/claude-to-clickup
Send a prompt to Claude and create/update a ClickUp task with the response.

Request body:
```json
{
  "prompt": "Your prompt for Claude",
  "listId": "optional_list_id",
  "taskId": "optional_task_id_to_update"
}
```

### POST /api/clickup-to-claude
Analyze a ClickUp task with Claude.

Request body:
```json
{
  "taskId": "clickup_task_id",
  "action": "analyze|summarize|generate_description"
}
```

### POST /api/webhook/clickup
Webhook endpoint for ClickUp events.

## Getting API Credentials

### Claude API Key
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

### ClickUp API Token
1. Go to ClickUp Settings
2. Navigate to "Apps" or "Integrations"
3. Click on "ClickUp API"
4. Generate a personal API token

### Finding ClickUp IDs
- Workspace ID: Found in ClickUp settings under Workspace
- List ID: Navigate to a list and check the URL or use the API to fetch lists

## Features

- Create ClickUp tasks from Claude responses
- Analyze existing tasks with AI
- Add AI-generated comments to tasks
- Webhook support for automated task analysis
- Generate detailed task descriptions from brief inputs