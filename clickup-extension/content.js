// Claude AI ClickUp Integration - Content Script

class ClaudeClickUpIntegration {
  constructor() {
    this.apiUrl = 'https://claudeup.onrender.com';
    this.credentials = null;
    this.init();
  }

  async init() {
    // Load credentials from storage
    await this.loadCredentials();
    
    // Wait for ClickUp to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.injectAIFeatures());
    } else {
      this.injectAIFeatures();
    }

    // Re-inject when page changes (ClickUp is a SPA)
    this.observePageChanges();
  }

  async loadCredentials() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['username', 'password'], (result) => {
        if (result.username && result.password) {
          this.credentials = btoa(`${result.username}:${result.password}`);
        }
        resolve();
      });
    });
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-inject AI features when new content is added
          setTimeout(() => this.injectAIFeatures(), 1000);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  injectAIFeatures() {
    this.addAIButtonToTaskCreation();
    this.addAIButtonsToTasks();
    this.addAIFloatingButton();
  }

  // Add AI button to task creation form
  addAIButtonToTaskCreation() {
    const taskInputs = document.querySelectorAll('[data-test="task-name-input"], .task-name-input, [placeholder*="task"], [placeholder*="Task"]');
    
    taskInputs.forEach(input => {
      if (input.dataset.claudeAiAdded) return;
      input.dataset.claudeAiAdded = 'true';

      const aiButton = this.createAIButton('✨ AI Expand', () => {
        this.expandTaskDescription(input);
      });

      aiButton.style.marginLeft = '10px';
      aiButton.style.display = 'inline-block';

      // Insert after the input
      if (input.parentNode) {
        input.parentNode.insertBefore(aiButton, input.nextSibling);
      }
    });
  }

  // Add AI buttons to existing tasks
  addAIButtonsToTasks() {
    const tasks = document.querySelectorAll('[data-test="task-row"], .task-row, .cu-task-row');
    
    tasks.forEach(task => {
      if (task.dataset.claudeAiAdded) return;
      task.dataset.claudeAiAdded = 'true';

      const aiMenu = this.createTaskAIMenu(task);
      
      // Find a good spot to inject the menu
      const taskActions = task.querySelector('.task-row__actions, .cu-task-row__actions') || task;
      if (taskActions) {
        taskActions.appendChild(aiMenu);
      }
    });
  }

  // Add floating AI assistant button
  addAIFloatingButton() {
    if (document.getElementById('claude-ai-float')) return;

    const floatButton = document.createElement('div');
    floatButton.id = 'claude-ai-float';
    floatButton.innerHTML = '🤖 AI';
    floatButton.className = 'claude-ai-float';
    floatButton.title = 'Claude AI Assistant';
    
    floatButton.onclick = () => this.openAIAssistant();
    
    document.body.appendChild(floatButton);
  }

  createAIButton(text, onClick) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.className = 'claude-ai-btn';
    button.onclick = onClick;
    return button;
  }

  createTaskAIMenu(taskElement) {
    const menu = document.createElement('div');
    menu.className = 'claude-ai-menu';
    menu.innerHTML = `
      <div class="claude-ai-menu-trigger">🤖</div>
      <div class="claude-ai-menu-content">
        <button class="claude-ai-menu-item" data-action="analyze">📊 Analyze Task</button>
        <button class="claude-ai-menu-item" data-action="expand">📝 Expand Description</button>
        <button class="claude-ai-menu-item" data-action="comment">💬 AI Comment</button>
        <button class="claude-ai-menu-item" data-action="estimate">⏱️ Time Estimate</button>
      </div>
    `;

    // Add click handlers
    menu.querySelectorAll('.claude-ai-menu-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const taskId = this.extractTaskId(taskElement);
        this.performTaskAction(action, taskId, taskElement);
        this.closeAllMenus();
      };
    });

    // Toggle menu
    const trigger = menu.querySelector('.claude-ai-menu-trigger');
    trigger.onclick = (e) => {
      e.stopPropagation();
      this.toggleMenu(menu);
    };

    return menu;
  }

  toggleMenu(menu) {
    this.closeAllMenus();
    menu.classList.toggle('active');
  }

  closeAllMenus() {
    document.querySelectorAll('.claude-ai-menu').forEach(m => m.classList.remove('active'));
  }

  extractTaskId(taskElement) {
    // Try multiple methods to extract task ID
    const urlMatch = window.location.href.match(/\/t\/([a-zA-Z0-9]+)/);
    if (urlMatch) return urlMatch[1];

    // Look for task ID in data attributes
    const taskId = taskElement.dataset.taskId || 
                   taskElement.dataset.id ||
                   taskElement.getAttribute('data-task-id');
    
    if (taskId) return taskId;

    // Look for task ID in child elements
    const taskLink = taskElement.querySelector('a[href*="/t/"]');
    if (taskLink) {
      const match = taskLink.href.match(/\/t\/([a-zA-Z0-9]+)/);
      if (match) return match[1];
    }

    return null;
  }

  async expandTaskDescription(input) {
    if (!this.credentials) {
      this.showError('Please set your credentials in the extension popup');
      return;
    }

    const briefText = input.value.trim();
    if (!briefText) {
      this.showError('Please enter a task description first');
      return;
    }

    this.showLoading(input, 'Expanding with AI...');

    try {
      const response = await fetch(`${this.apiUrl}/api/claude-to-clickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.credentials}`
        },
        body: JSON.stringify({
          prompt: `Expand this brief task description into a detailed, actionable task: "${briefText}"`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Find description field and populate it
        const descriptionField = this.findDescriptionField();
        if (descriptionField) {
          descriptionField.value = result.claudeResponse;
          descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        this.showSuccess('Task expanded with AI insights!');
      } else {
        this.showError(result.error || 'Failed to expand task');
      }
    } catch (error) {
      this.showError('Network error: ' + error.message);
    }

    this.hideLoading(input);
  }

  async performTaskAction(action, taskId, taskElement) {
    if (!this.credentials) {
      this.showError('Please set your credentials in the extension popup');
      return;
    }

    if (!taskId) {
      this.showError('Could not find task ID');
      return;
    }

    const prompts = {
      analyze: 'Provide a detailed analysis of this task including complexity, dependencies, and recommendations',
      expand: 'Generate a detailed description for this task with clear acceptance criteria',
      comment: 'Provide helpful insights and best practices for this task',
      estimate: 'Estimate the time required for this task and explain your reasoning'
    };

    this.showLoading(taskElement, 'AI working...');

    try {
      let response;
      
      if (action === 'analyze' || action === 'estimate') {
        // Use analyze endpoint
        response = await fetch(`${this.apiUrl}/api/clickup-to-claude`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.credentials}`
          },
          body: JSON.stringify({
            taskId: taskId,
            action: 'analyze'
          })
        });
      } else {
        // Use comment endpoint
        response = await fetch(`${this.apiUrl}/api/claude-to-clickup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.credentials}`
          },
          body: JSON.stringify({
            prompt: prompts[action],
            taskId: taskId
          })
        });
      }

      const result = await response.json();
      
      if (result.success) {
        this.showAIResult(result.claudeResponse, action);
      } else {
        this.showError(result.error || 'AI request failed');
      }
    } catch (error) {
      this.showError('Network error: ' + error.message);
    }

    this.hideLoading(taskElement);
  }

  showAIResult(text, action) {
    // Create modal to show AI result
    const modal = document.createElement('div');
    modal.className = 'claude-ai-modal';
    modal.innerHTML = `
      <div class="claude-ai-modal-content">
        <div class="claude-ai-modal-header">
          <h3>🤖 AI ${action.charAt(0).toUpperCase() + action.slice(1)}</h3>
          <button class="claude-ai-modal-close">&times;</button>
        </div>
        <div class="claude-ai-modal-body">
          <pre>${text}</pre>
        </div>
        <div class="claude-ai-modal-footer">
          <button class="claude-ai-btn" onclick="navigator.clipboard.writeText('${text.replace(/'/g, "\\'")}')">📋 Copy</button>
          <button class="claude-ai-btn claude-ai-modal-close">Close</button>
        </div>
      </div>
    `;

    // Close handlers
    modal.querySelectorAll('.claude-ai-modal-close').forEach(btn => {
      btn.onclick = () => modal.remove();
    });

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  openAIAssistant() {
    // Open quick AI assistant
    const assistant = document.createElement('div');
    assistant.className = 'claude-ai-assistant';
    assistant.innerHTML = `
      <div class="claude-ai-assistant-content">
        <div class="claude-ai-assistant-header">
          <h3>🤖 Claude AI Assistant</h3>
          <button class="claude-ai-assistant-close">&times;</button>
        </div>
        <div class="claude-ai-assistant-body">
          <textarea placeholder="Describe what you want to create or ask about..." rows="4"></textarea>
          <div class="claude-ai-assistant-actions">
            <button class="claude-ai-btn" data-action="create">📝 Create Task</button>
            <button class="claude-ai-btn" data-action="analyze">📊 Analyze Current</button>
          </div>
        </div>
      </div>
    `;

    // Add handlers
    assistant.querySelector('.claude-ai-assistant-close').onclick = () => assistant.remove();
    assistant.onclick = (e) => { if (e.target === assistant) assistant.remove(); };

    assistant.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = async () => {
        const textarea = assistant.querySelector('textarea');
        const prompt = textarea.value.trim();
        if (!prompt) return;

        if (btn.dataset.action === 'create') {
          await this.createTaskFromPrompt(prompt);
        }
        
        assistant.remove();
      };
    });

    document.body.appendChild(assistant);
    assistant.querySelector('textarea').focus();
  }

  async createTaskFromPrompt(prompt) {
    if (!this.credentials) {
      this.showError('Please set your credentials in the extension popup');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/claude-to-clickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.credentials}`
        },
        body: JSON.stringify({ prompt })
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess(`Task created: ${result.task.name}`);
        // Optionally refresh the page or redirect to the new task
        if (result.task.url) {
          window.open(result.task.url, '_blank');
        }
      } else {
        this.showError(result.error || 'Failed to create task');
      }
    } catch (error) {
      this.showError('Network error: ' + error.message);
    }
  }

  findDescriptionField() {
    // Try to find description/details field
    const selectors = [
      '[data-test="task-description"]',
      '.task-description',
      '[placeholder*="description"]',
      '[placeholder*="Description"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const field = document.querySelector(selector);
      if (field) return field;
    }

    return null;
  }

  showLoading(element, message) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
    
    // Add loading indicator
    const loader = document.createElement('div');
    loader.className = 'claude-ai-loader';
    loader.textContent = message;
    element.parentNode?.appendChild(loader);
  }

  hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
    
    // Remove loading indicator
    const loader = element.parentNode?.querySelector('.claude-ai-loader');
    if (loader) loader.remove();
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `claude-ai-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
}

// Initialize the integration
const claudeIntegration = new ClaudeClickUpIntegration();

// Clean up menus on click outside
document.addEventListener('click', () => {
  claudeIntegration.closeAllMenus();
});