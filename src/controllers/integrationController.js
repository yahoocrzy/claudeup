const claudeService = require('../services/claudeService');
const clickupService = require('../services/clickupService');
const config = require('../config/config');

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

  // Handle ClickUp webhooks
  async clickUpWebhook(req, res) {
    try {
      const { event, task_id, history_items } = req.body;

      // Verify webhook secret if configured
      if (config.webhook.secret) {
        const signature = req.headers['x-signature'];
        // Implement signature verification logic here
      }

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
}

module.exports = new IntegrationController();