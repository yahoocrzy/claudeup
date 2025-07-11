const claudeService = require('../services/claudeService');
const clickupService = require('../services/clickupService');
const config = require('../config/config');
const { validateRequest } = require('../utils/validation');
const { verifyWebhookSignature } = require('../middleware/auth');

class IntegrationController {
  // Process Claude response and create/update ClickUp task
  async claudeToClickUp(req, res) {
    try {
      const { prompt, listId, taskId } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Get Claude's response
      const claudeResponse = await claudeService.sendMessage(prompt);

      // If taskId is provided, update existing task
      if (taskId) {
        const comment = await clickupService.addComment(taskId, claudeResponse);
        return res.json({
          success: true,
          action: 'comment_added',
          taskId,
          comment: comment
        });
      }

      // Otherwise, create a new task
      const targetListId = listId || config.clickup.defaultListId;
      if (!targetListId) {
        return res.status(400).json({ error: 'List ID is required for creating tasks' });
      }

      // Parse Claude's response to create task (you can enhance this logic)
      const taskData = {
        name: prompt.substring(0, 100), // Use first 100 chars of prompt as title
        description: claudeResponse,
        status: 'to do'
      };

      const newTask = await clickupService.createTask(targetListId, taskData);

      res.json({
        success: true,
        action: 'task_created',
        task: newTask,
        claudeResponse
      });
    } catch (error) {
      console.error('Error in claudeToClickUp:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get ClickUp task details and process with Claude
  async clickUpToClaude(req, res) {
    try {
      const { taskId, action } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Fetch task details from ClickUp
      const task = await clickupService.getTask(taskId);

      let claudeResponse;
      switch (action) {
        case 'analyze':
          claudeResponse = await claudeService.analyzeTask(task);
          break;
        case 'summarize':
          const comments = await clickupService.getComments(taskId);
          claudeResponse = await claudeService.summarizeTasks([task]);
          break;
        case 'generate_description':
          claudeResponse = await claudeService.generateTaskDescription(task.name);
          break;
        default:
          claudeResponse = await claudeService.analyzeTask(task);
      }

      res.json({
        success: true,
        task,
        claudeResponse,
        action: action || 'analyze'
      });
    } catch (error) {
      console.error('Error in clickUpToClaude:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Handle ClickUp webhooks (with signature verification)
  async clickUpWebhook(req, res, next) {
    // First verify the webhook signature
    verifyWebhookSignature(req, res, (err) => {
      if (err) return next(err);
      
      this._handleWebhook(req, res).catch(next);
    });
  }

  async _handleWebhook(req, res) {
    try {
      const { event, task_id, history_items } = req.body;

      console.log('Webhook received:', event);

      // Handle different webhook events
      switch (event) {
        case 'taskCreated':
          // Optionally analyze new tasks automatically
          if (task_id) {
            const task = await clickupService.getTask(task_id);
            const analysis = await claudeService.analyzeTask(task);
            await clickupService.addComment(task_id, `AI Analysis: ${analysis}`);
          }
          break;
        case 'taskUpdated':
          // Handle task updates
          console.log('Task updated:', task_id);
          break;
        case 'taskCommentPosted':
          // Optionally respond to comments with AI
          console.log('New comment on task:', task_id);
          break;
      }

      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all lists in the workspace
  async getAllLists(req, res) {
    try {
      // First get teams
      const teams = await clickupService.getTeams();
      if (!teams || teams.length === 0) {
        return res.status(404).json({ error: 'No teams found' });
      }

      // Use the first team or match workspace ID
      const team = teams.find(t => t.id === config.clickup.workspaceId) || teams[0];
      
      // Get spaces in the team
      const spaces = await clickupService.getSpaces(team.id);
      
      // Get all lists from all spaces
      const allLists = [];
      for (const space of spaces) {
        const lists = await clickupService.getLists(space.id);
        lists.forEach(list => {
          allLists.push({
            id: list.id,
            name: list.name,
            space: space.name,
            status: list.status,
            task_count: list.task_count
          });
        });
      }

      res.json({
        success: true,
        workspace: {
          id: team.id,
          name: team.name
        },
        lists: allLists,
        defaultListId: config.clickup.defaultListId,
        message: `Found ${allLists.length} lists in ${spaces.length} spaces`
      });
    } catch (error) {
      console.error('Error fetching lists:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get workspace information
  async getWorkspaceInfo(req, res) {
    try {
      const teams = await clickupService.getTeams();
      
      const workspaceInfo = teams.map(team => ({
        id: team.id,
        name: team.name,
        color: team.color,
        members: team.members?.length || 0
      }));

      res.json({
        success: true,
        workspaces: workspaceInfo,
        configuredWorkspaceId: config.clickup.workspaceId,
        message: `Found ${workspaceInfo.length} workspace(s)`
      });
    } catch (error) {
      console.error('Error fetching workspace info:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Setup helper - get lists without authentication (for initial setup only)
  async getSetupLists(req, res) {
    try {
      // Only work if ClickUp token is configured
      if (!config.clickup.apiToken || config.clickup.apiToken === 'your_clickup_api_token_here') {
        return res.status(400).json({ 
          error: 'ClickUp API token not configured',
          message: 'Please set CLICKUP_API_TOKEN in your environment variables'
        });
      }

      const teams = await clickupService.getTeams();
      if (!teams || teams.length === 0) {
        return res.status(404).json({ error: 'No teams found. Check your ClickUp API token.' });
      }

      const team = teams.find(t => t.id === config.clickup.workspaceId) || teams[0];
      const spaces = await clickupService.getSpaces(team.id);
      
      const allLists = [];
      for (const space of spaces) {
        const lists = await clickupService.getLists(space.id);
        lists.forEach(list => {
          allLists.push({
            id: list.id,
            name: list.name,
            space: space.name
          });
        });
      }

      res.json({
        success: true,
        workspace: {
          id: team.id,
          name: team.name,
          configuredId: config.clickup.workspaceId
        },
        lists: allLists,
        currentDefaultListId: config.clickup.defaultListId,
        setupInstructions: 'Update your CLICKUP_LIST_ID environment variable with one of the list IDs above'
      });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch lists',
        details: error.response?.data || error.message,
        hint: 'Check your CLICKUP_API_TOKEN and CLICKUP_WORKSPACE_ID'
      });
    }
  }
}

module.exports = new IntegrationController();