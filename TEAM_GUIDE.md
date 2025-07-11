# Claude-ClickUp AI Integration - Team Guide

## 🚀 Overview

Our team now has access to an AI-powered integration that connects Claude AI with ClickUp. This tool helps create intelligent tasks, analyze existing work, and automate project management with AI insights.

**API Base URL:** `https://claudeup.onrender.com`

---

## 📋 What You Can Do

### 1. **Create AI-Powered Tasks**
- Transform brief ideas into detailed, actionable tasks
- Get comprehensive task descriptions with acceptance criteria
- Automatically organize work with AI insights

### 2. **Analyze Existing Tasks**
- Get AI analysis of task complexity and time estimates
- Identify potential blockers and dependencies
- Receive suggestions for task improvements

### 3. **Add AI Comments**
- Ask AI questions about specific tasks
- Get expert advice on implementation approaches
- Receive best practices and recommendations

---

## 🛠️ How to Use the API

### Method 1: Using curl (Command Line)

#### Create an AI Task
```bash
curl -X POST https://claudeup.onrender.com/api/claude-to-clickup \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a task to implement user authentication with OAuth2 including Google and GitHub login options"
  }'
```

#### Analyze an Existing Task
```bash
curl -X POST https://claudeup.onrender.com/api/clickup-to-claude \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "86a9z79jh",
    "action": "analyze"
  }'
```

#### Add AI Comment to Task
```bash
curl -X POST https://claudeup.onrender.com/api/claude-to-clickup \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the security considerations for this authentication feature?",
    "taskId": "86a9z79jh"
  }'
```

### Method 2: Using Postman or Similar Tools

1. **Set Request Type:** POST
2. **Set URL:** `https://claudeup.onrender.com/api/claude-to-clickup`
3. **Set Headers:** `Content-Type: application/json`
4. **Set Body (JSON):**
   ```json
   {
     "prompt": "Your task description here"
   }
   ```

### Method 3: JavaScript/Web Integration

```javascript
// Create a task
async function createAITask(description) {
  const response = await fetch('https://claudeup.onrender.com/api/claude-to-clickup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: description
    })
  });
  
  const result = await response.json();
  console.log('Task created:', result);
}

// Usage
createAITask("Create a task for implementing dark mode toggle with user preferences");
```

---

## 📚 API Reference

### Endpoints

#### 1. **Health Check**
- **URL:** `GET /health`
- **Purpose:** Check if the API is running
- **Response:** `{"status": "healthy", "message": "Claude-ClickUp Integration API is running"}`

#### 2. **Create AI Task**
- **URL:** `POST /api/claude-to-clickup`
- **Purpose:** Create new tasks or add comments to existing tasks

**Request Body:**
```json
{
  "prompt": "Description of what you want to create or ask",
  "listId": "optional_specific_list_id",
  "taskId": "optional_existing_task_id_for_comments"
}
```

**Response (New Task):**
```json
{
  "success": true,
  "action": "task_created",
  "task": {
    "id": "task_id",
    "name": "Task Name",
    "url": "https://app.clickup.com/t/task_id"
  },
  "claudeResponse": "AI-generated detailed description"
}
```

#### 3. **Analyze Task**
- **URL:** `POST /api/clickup-to-claude`
- **Purpose:** Get AI analysis of existing ClickUp tasks

**Request Body:**
```json
{
  "taskId": "clickup_task_id",
  "action": "analyze"
}
```

**Available Actions:**
- `analyze` - Full task analysis with insights
- `summarize` - Brief summary of the task
- `generate_description` - Create detailed description

**Response:**
```json
{
  "success": true,
  "task": {
    "name": "Task Name",
    "status": "to do"
  },
  "claudeResponse": "AI analysis and recommendations",
  "action": "analyze"
}
```

#### 4. **Webhook (Automatic)**
- **URL:** `POST /api/webhook/clickup`
- **Purpose:** Automatically process ClickUp events
- **Note:** This is configured in ClickUp settings and runs automatically

---

## 💡 Best Practices

### Writing Effective Prompts

#### ✅ Good Examples:
```json
{
  "prompt": "Create a task to implement a REST API for user management including CRUD operations, authentication middleware, and input validation"
}
```

```json
{
  "prompt": "Create a task for setting up automated testing pipeline with Jest, including unit tests, integration tests, and coverage reporting"
}
```

#### ❌ Avoid These:
```json
{
  "prompt": "Make a thing"
}
```

```json
{
  "prompt": "Fix bug"
}
```

### Task Analysis Tips

1. **Use specific task IDs** from ClickUp URLs
2. **Choose the right action:**
   - `analyze` for detailed insights
   - `summarize` for quick overview
   - `generate_description` for expanding brief tasks

### Finding Task IDs

1. **From ClickUp URL:**
   ```
   https://app.clickup.com/t/86a9z79jh
                            ↑
                        Task ID
   ```

2. **From ClickUp Task View:**
   - Open any task
   - Copy the task ID from the URL bar
   - Use this ID in API calls

---

## 🔧 Integration Examples

### Slack Bot Integration

```javascript
// Slack bot command: /create-task [description]
app.command('/create-task', async ({ command, ack, respond }) => {
  await ack();
  
  const response = await fetch('https://claudeup.onrender.com/api/claude-to-clickup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: command.text })
  });
  
  const result = await response.json();
  
  await respond({
    text: `✅ Task created: ${result.task.name}`,
    blocks: [{
      type: "section",
      text: { type: "mrkdwn", text: `*Task:* ${result.task.name}\n*Link:* ${result.task.url}` }
    }]
  });
});
```

### Browser Bookmarklet

Save this as a browser bookmark for quick task creation:

```javascript
javascript:(function(){
  const prompt = window.prompt('Describe your task:');
  if(prompt) {
    fetch('https://claudeup.onrender.com/api/claude-to-clickup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({prompt: prompt})
    }).then(r => r.json()).then(d => {
      alert('Task created: ' + (d.task?.name || 'Check ClickUp'));
    });
  }
})();
```

### Zapier Integration

1. **Trigger:** Email, Form Submission, etc.
2. **Action:** Webhook POST to `https://claudeup.onrender.com/api/claude-to-clickup`
3. **Body:** `{"prompt": "{{trigger_data}}"}`

---

## 🚨 Troubleshooting

### Common Issues

#### **Error: "Cannot read property"**
- **Cause:** Missing required fields
- **Fix:** Ensure `prompt` field is included in request body

#### **Error: "Task not found"**
- **Cause:** Invalid task ID
- **Fix:** Check task ID format and ensure task exists in ClickUp

#### **Error: "API timeout"**
- **Cause:** Claude AI taking too long to respond
- **Fix:** Try again with a shorter prompt or wait a moment

#### **No response from API**
- **Cause:** API might be sleeping (free tier limitation)
- **Fix:** First request might be slow, subsequent requests will be faster

### Getting Help

1. **Check API Status:** `GET https://claudeup.onrender.com/health`
2. **Verify Request Format:** Ensure JSON is properly formatted
3. **Test with Simple Prompt:** Try a basic request first

---

## 📊 Usage Examples by Role

### **Developers**
```json
{
  "prompt": "Create a task to implement JWT authentication middleware with token refresh, rate limiting, and proper error handling"
}
```

### **Designers**
```json
{
  "prompt": "Create a task to design a responsive dashboard layout with dark mode support, accessible navigation, and mobile-first approach"
}
```

### **Project Managers**
```json
{
  "prompt": "Create a task to conduct sprint retrospective, gather team feedback, identify blockers, and plan process improvements"
}
```

### **QA Engineers**
```json
{
  "prompt": "Create a task to develop comprehensive test plan for the new payment system including edge cases, security testing, and performance validation"
}
```

---

## 🔄 Workflow Automation

### Setting Up ClickUp Webhooks

1. **Go to ClickUp Settings → Integrations → Webhooks**
2. **Add Webhook:**
   - URL: `https://claudeup.onrender.com/api/webhook/clickup`
   - Events: Task Created, Task Updated, Comment Posted
3. **Save**

**What this enables:**
- Automatic AI analysis when tasks are created
- Smart suggestions added as comments
- Intelligent task categorization

### Team Workflow Example

1. **Someone creates a brief task** in ClickUp
2. **Webhook triggers** AI analysis automatically
3. **AI adds detailed comment** with:
   - Task breakdown suggestions
   - Time estimates
   - Potential dependencies
   - Best practices

---

## 📈 Performance Tips

### Optimizing Prompts

1. **Be Specific:** Include technology stack, requirements, constraints
2. **Provide Context:** Mention related features, user stories, business goals
3. **Set Expectations:** Specify priority level, deadline, complexity

### Batch Operations

For multiple tasks, consider creating them one at a time rather than in a single large prompt for better results.

---

## 🛡️ Security & Privacy

- **No Data Storage:** API doesn't store your prompts or task data
- **Secure Transmission:** All API calls use HTTPS
- **ClickUp Permissions:** API uses your team's ClickUp permissions
- **Rate Limiting:** API has built-in rate limiting for stability

---

## 📞 Support

For technical issues or questions:
1. Check this guide first
2. Test with the health endpoint
3. Verify your request format
4. Contact your technical team lead

---

**Happy task creation! 🚀**