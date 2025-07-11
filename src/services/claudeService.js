const axios = require('axios');
const config = require('../config/config');

class ClaudeService {
  constructor() {
    this.apiUrl = config.claude.apiUrl;
    this.apiKey = config.claude.apiKey;
    this.model = config.claude.model;
    this.maxTokens = config.claude.maxTokens;
  }

  // Send a message to Claude
  async sendMessage(message, systemPrompt = '') {
    try {
      const response = await axios.post(`${this.apiUrl}/messages`, {
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: message
        }],
        system: systemPrompt || 'You are a helpful AI assistant integrated with ClickUp. Help users manage their tasks and projects effectively.'
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error('Error sending message to Claude:', error.response?.data || error.message);
      throw error;
    }
  }

  // Analyze task content and generate suggestions
  async analyzeTask(taskData) {
    const prompt = `Analyze this task and provide helpful suggestions:
    Title: ${taskData.name}
    Description: ${taskData.description || 'No description provided'}
    Status: ${taskData.status?.status || 'No status'}
    Priority: ${taskData.priority?.priority || 'No priority'}
    
    Please provide:
    1. Task breakdown suggestions
    2. Potential blockers or dependencies
    3. Time estimation
    4. Any other helpful insights`;

    return await this.sendMessage(prompt);
  }

  // Generate task description from brief input
  async generateTaskDescription(briefInput) {
    const prompt = `Generate a clear and detailed task description based on this brief input: "${briefInput}"
    
    Include:
    - Clear objectives
    - Acceptance criteria
    - Potential subtasks
    - Any relevant considerations`;

    return await this.sendMessage(prompt);
  }

  // Summarize multiple tasks
  async summarizeTasks(tasks) {
    const taskList = tasks.map(task => `- ${task.name}: ${task.status?.status || 'No status'}`).join('\n');
    const prompt = `Summarize the following tasks and provide an overview of the work:
    
    ${taskList}
    
    Please provide:
    1. Overall project status
    2. Key priorities
    3. Potential bottlenecks
    4. Recommendations`;

    return await this.sendMessage(prompt);
  }

  // Generate response for task comments
  async generateCommentResponse(taskContext, comment) {
    const prompt = `Given this task context and comment, generate a helpful response:
    
    Task: ${taskContext.name}
    Description: ${taskContext.description || 'No description'}
    Comment: ${comment}
    
    Provide a helpful and constructive response.`;

    return await this.sendMessage(prompt);
  }
}

module.exports = new ClaudeService();