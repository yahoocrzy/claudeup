const axios = require('axios');
const config = require('../config/config');

class ClickUpService {
  constructor() {
    this.apiUrl = config.clickup.apiUrl;
    this.apiToken = config.clickup.apiToken;
    this.headers = {
      'Authorization': this.apiToken,
      'Content-Type': 'application/json'
    };
    
    // Create axios instance with default timeout
    this.client = axios.create({
      timeout: 10000, // 10 second timeout
      headers: this.headers
    });
  }

  // Get workspace teams
  async getTeams() {
    try {
      const response = await this.client.get(`${this.apiUrl}/team`);
      return response.data.teams;
    } catch (error) {
      console.error('Error fetching teams:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get spaces in a workspace
  async getSpaces(teamId) {
    try {
      const response = await this.client.get(`${this.apiUrl}/team/${teamId}/space`);
      return response.data.spaces;
    } catch (error) {
      console.error('Error fetching spaces:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get lists in a space
  async getLists(spaceId) {
    try {
      const response = await this.client.get(`${this.apiUrl}/space/${spaceId}/list`);
      return response.data.lists;
    } catch (error) {
      console.error('Error fetching lists:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create a task
  async createTask(listId, taskData) {
    try {
      const response = await this.client.post(`${this.apiUrl}/list/${listId}/task`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get task by ID
  async getTask(taskId) {
    try {
      const response = await this.client.get(`${this.apiUrl}/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update task
  async updateTask(taskId, updateData) {
    try {
      const response = await this.client.put(`${this.apiUrl}/task/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Add comment to task
  async addComment(taskId, comment) {
    try {
      const response = await this.client.post(`${this.apiUrl}/task/${taskId}/comment`, {
        comment_text: comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get task comments
  async getComments(taskId) {
    try {
      const response = await this.client.get(`${this.apiUrl}/task/${taskId}/comment`);
      return response.data.comments;
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ClickUpService();