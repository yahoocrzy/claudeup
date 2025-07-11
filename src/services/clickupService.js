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
  }

  // Get workspace teams
  async getTeams() {
    try {
      const response = await axios.get(`${this.apiUrl}/team`, {
        headers: this.headers
      });
      return response.data.teams;
    } catch (error) {
      console.error('Error fetching teams:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get spaces in a workspace
  async getSpaces(teamId) {
    try {
      const response = await axios.get(`${this.apiUrl}/team/${teamId}/space`, {
        headers: this.headers
      });
      return response.data.spaces;
    } catch (error) {
      console.error('Error fetching spaces:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get lists in a space
  async getLists(spaceId) {
    try {
      const response = await axios.get(`${this.apiUrl}/space/${spaceId}/list`, {
        headers: this.headers
      });
      return response.data.lists;
    } catch (error) {
      console.error('Error fetching lists:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create a task
  async createTask(listId, taskData) {
    try {
      const response = await axios.post(`${this.apiUrl}/list/${listId}/task`, taskData, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get task by ID
  async getTask(taskId) {
    try {
      const response = await axios.get(`${this.apiUrl}/task/${taskId}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update task
  async updateTask(taskId, updateData) {
    try {
      const response = await axios.put(`${this.apiUrl}/task/${taskId}`, updateData, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      throw error;
    }
  }

  // Add comment to task
  async addComment(taskId, comment) {
    try {
      const response = await axios.post(`${this.apiUrl}/task/${taskId}/comment`, {
        comment_text: comment
      }, {
        headers: this.headers
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
      const response = await axios.get(`${this.apiUrl}/task/${taskId}/comment`, {
        headers: this.headers
      });
      return response.data.comments;
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ClickUpService();