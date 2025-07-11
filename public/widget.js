// Claude AI ClickUp Widget - Standalone JavaScript Integration
// This file can be loaded on any ClickUp page for instant AI features

(function() {
  'use strict';
  
  // Configuration
  const API_URL = 'https://claudeup.onrender.com';
  const WIDGET_ID = 'claude-ai-clickup-widget';
  
  // Check if already loaded
  if (window.claudeAIWidget || document.getElementById(WIDGET_ID)) {
    console.log('Claude AI Widget already loaded');
    return;
  }
  
  // Main widget class
  class ClaudeAIWidget {
    constructor() {
      this.apiUrl = API_URL;
      this.credentials = null;
      this.isVisible = false;
      this.loadCredentials();
      this.init();
    }
    
    // Initialize the widget
    init() {
      this.createWidget();
      this.injectStyles();
      this.setupEventListeners();
      this.show();
    }
    
    // Load credentials from localStorage
    loadCredentials() {
      try {
        const saved = localStorage.getItem('claude-ai-credentials');
        if (saved) {
          const creds = JSON.parse(saved);
          this.credentials = btoa(`${creds.username}:${creds.password}`);
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
      }
    }
    
    // Save credentials to localStorage
    saveCredentials(username, password) {
      try {
        localStorage.setItem('claude-ai-credentials', JSON.stringify({
          username: username,
          password: password
        }));
        this.credentials = btoa(`${username}:${password}`);
        return true;
      } catch (error) {
        console.error('Error saving credentials:', error);
        return false;
      }
    }
    
    // Create the main widget HTML
    createWidget() {
      const widget = document.createElement('div');
      widget.id = WIDGET_ID;
      widget.innerHTML = `
        <div class="claude-widget-header">
          <div class="claude-widget-title">
            <span class="claude-widget-icon">🤖</span>
            <span class="claude-widget-text">Claude AI</span>
          </div>
          <div class="claude-widget-controls">
            <button class="claude-widget-minimize" title="Minimize">−</button>
            <button class="claude-widget-close" title="Close">×</button>
          </div>
        </div>
        
        <div class="claude-widget-content">
          ${this.credentials ? this.getMainInterface() : this.getSetupInterface()}
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
    }
    
    // Get setup interface HTML
    getSetupInterface() {
      return `
        <div class="claude-setup">
          <h3>🔐 Setup Required</h3>
          <p>Enter your team credentials to use Claude AI:</p>
          <div class="claude-form-group">
            <input type="text" id="claude-username" placeholder="Username" value="teamuser">
          </div>
          <div class="claude-form-group">
            <input type="password" id="claude-password" placeholder="Password" value="teampass123">
          </div>
          <div class="claude-form-actions">
            <button class="claude-btn-primary" onclick="window.claudeAIWidget.setupCredentials()">
              Save & Continue
            </button>
          </div>
        </div>
      `;
    }
    
    // Get main interface HTML
    getMainInterface() {
      return `
        <div class="claude-tabs">
          <button class="claude-tab active" data-tab="quick">⚡ Quick</button>
          <button class="claude-tab" data-tab="create">✨ Create</button>
          <button class="claude-tab" data-tab="analyze">📊 Analyze</button>
        </div>
        
        <!-- Quick Tab -->
        <div class="claude-tab-content active" id="claude-quick">
          <div class="claude-quick-actions">
            <button class="claude-quick-btn" onclick="window.claudeAIWidget.quickAction('current')">
              📍 Analyze Current Task
            </button>
            <button class="claude-quick-btn" onclick="window.claudeAIWidget.quickAction('enhance')">
              🚀 Enhance Current Task
            </button>
            <button class="claude-quick-btn" onclick="window.claudeAIWidget.quickAction('comment')">
              💬 Add AI Comment
            </button>
          </div>
          <div class="claude-quick-input">
            <textarea id="claude-quick-prompt" placeholder="Quick AI request..." rows="2"></textarea>
            <button class="claude-btn-primary" onclick="window.claudeAIWidget.quickCreate()">
              ⚡ Quick Create
            </button>
          </div>
        </div>
        
        <!-- Create Tab -->
        <div class="claude-tab-content" id="claude-create">
          <textarea id="claude-create-prompt" placeholder="Describe your task in detail...
Examples:
• Build user authentication with OAuth2
• Create REST API for inventory management
• Design responsive dashboard with charts" rows="4"></textarea>
          <div class="claude-form-actions">
            <button class="claude-btn-primary" onclick="window.claudeAIWidget.createTask()">
              ✨ Create AI Task
            </button>
          </div>
        </div>
        
        <!-- Analyze Tab -->
        <div class="claude-tab-content" id="claude-analyze">
          <input type="text" id="claude-task-id" placeholder="Task ID or URL">
          <div class="claude-form-actions">
            <button class="claude-btn-primary" onclick="window.claudeAIWidget.analyzeTask()">
              📊 Analyze Task
            </button>
            <button class="claude-btn-secondary" onclick="window.claudeAIWidget.getCurrentTaskId()">
              📍 Use Current
            </button>
          </div>
        </div>
        
        <div class="claude-status" id="claude-status"></div>
        <div class="claude-result" id="claude-result"></div>
      `;
    }
    
    // Setup credentials
    setupCredentials() {
      const username = document.getElementById('claude-username').value.trim();
      const password = document.getElementById('claude-password').value.trim();
      
      if (!username || !password) {
        this.showStatus('Please enter both username and password', 'error');
        return;
      }
      
      if (this.saveCredentials(username, password)) {
        this.updateContent(this.getMainInterface());
        this.setupEventListeners();
        this.showStatus('✅ Credentials saved! Widget ready to use.', 'success');
      } else {
        this.showStatus('Error saving credentials', 'error');
      }
    }
    
    // Update widget content
    updateContent(html) {
      const content = this.widget.querySelector('.claude-widget-content');
      content.innerHTML = html;
    }
    
    // Setup event listeners
    setupEventListeners() {
      // Tab switching
      this.widget.querySelectorAll('.claude-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.switchTab(e.target.dataset.tab);
        });
      });
      
      // Widget controls
      const minimizeBtn = this.widget.querySelector('.claude-widget-minimize');
      const closeBtn = this.widget.querySelector('.claude-widget-close');
      
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }
      
      // Make widget draggable
      this.makeDraggable();
      
      // Enter key handling
      this.widget.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          const activeTab = this.widget.querySelector('.claude-tab.active').dataset.tab;
          if (activeTab === 'create') {
            this.createTask();
          } else if (activeTab === 'analyze') {
            this.analyzeTask();
          }
        }
      });
    }
    
    // Switch tabs
    switchTab(tabName) {
      this.widget.querySelectorAll('.claude-tab').forEach(t => t.classList.remove('active'));
      this.widget.querySelectorAll('.claude-tab-content').forEach(c => c.classList.remove('active'));
      
      this.widget.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
      this.widget.querySelector(`#claude-${tabName}`).classList.add('active');
      
      this.hideResult();
    }
    
    // Quick actions
    async quickAction(action) {
      if (!this.credentials) {
        this.showStatus('Please setup credentials first', 'error');
        return;
      }
      
      const taskId = this.getCurrentTaskFromURL();
      if (!taskId && action !== 'enhance') {
        this.showStatus('No current task found. Navigate to a task first.', 'error');
        return;
      }
      
      this.showStatus('🤖 Processing...', 'loading');
      
      try {
        let response;
        
        switch (action) {
          case 'current':
            response = await this.apiCall('/api/clickup-to-claude', {
              taskId: taskId,
              action: 'analyze'
            });
            break;
            
          case 'enhance':
            const selectedText = this.getSelectedText() || this.getTaskDescriptionFromPage();
            if (!selectedText) {
              this.showStatus('No text found to enhance. Select text or navigate to a task.', 'error');
              return;
            }
            response = await this.apiCall('/api/claude-to-clickup', {
              prompt: `Enhance this task description: "${selectedText}"`
            });
            break;
            
          case 'comment':
            response = await this.apiCall('/api/claude-to-clickup', {
              prompt: 'Provide helpful insights and recommendations for this task',
              taskId: taskId
            });
            break;
        }
        
        if (response && response.success) {
          this.showResult(response, action);
        } else {
          this.showStatus('❌ ' + (response?.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    }
    
    // Quick create
    async quickCreate() {
      const prompt = this.widget.querySelector('#claude-quick-prompt').value.trim();
      if (!prompt) {
        this.showStatus('Please enter a prompt', 'error');
        return;
      }
      
      this.showStatus('🤖 Creating task...', 'loading');
      
      try {
        const response = await this.apiCall('/api/claude-to-clickup', { prompt });
        
        if (response.success) {
          this.showResult(response, 'create');
          this.widget.querySelector('#claude-quick-prompt').value = '';
        } else {
          this.showStatus('❌ ' + (response.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    }
    
    // Create task
    async createTask() {
      const prompt = this.widget.querySelector('#claude-create-prompt').value.trim();
      if (!prompt) {
        this.showStatus('Please enter a task description', 'error');
        return;
      }
      
      this.showStatus('🤖 Creating detailed task...', 'loading');
      
      try {
        const response = await this.apiCall('/api/claude-to-clickup', { prompt });
        
        if (response.success) {
          this.showResult(response, 'create');
          this.widget.querySelector('#claude-create-prompt').value = '';
        } else {
          this.showStatus('❌ ' + (response.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    }
    
    // Analyze task
    async analyzeTask() {
      const input = this.widget.querySelector('#claude-task-id').value.trim();
      if (!input) {
        this.showStatus('Please enter a task ID or URL', 'error');
        return;
      }
      
      const taskId = this.extractTaskId(input);
      if (!taskId) {
        this.showStatus('Invalid task ID or URL', 'error');
        return;
      }
      
      this.showStatus('🤖 Analyzing task...', 'loading');
      
      try {
        const response = await this.apiCall('/api/clickup-to-claude', {
          taskId: taskId,
          action: 'analyze'
        });
        
        if (response.success) {
          this.showResult(response, 'analyze');
        } else {
          this.showStatus('❌ ' + (response.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    }
    
    // Get current task ID
    getCurrentTaskId() {
      const taskId = this.getCurrentTaskFromURL();
      if (taskId) {
        this.widget.querySelector('#claude-task-id').value = taskId;
        this.showStatus('✅ Current task ID loaded', 'success');
      } else {
        this.showStatus('No task found in current URL', 'error');
      }
    }
    
    // API call helper
    async apiCall(endpoint, data) {
      const response = await fetch(this.apiUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + this.credentials
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    }
    
    // Utility methods
    getCurrentTaskFromURL() {
      const match = window.location.href.match(/\/t\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    }
    
    extractTaskId(input) {
      const urlMatch = input.match(/\/t\/([a-zA-Z0-9]+)/);
      if (urlMatch) return urlMatch[1];
      
      if (/^[a-zA-Z0-9]+$/.test(input)) return input;
      
      return null;
    }
    
    getSelectedText() {
      return window.getSelection().toString().trim();
    }
    
    getTaskDescriptionFromPage() {
      // Try to find task description on the page
      const selectors = [
        '.task-description',
        '[data-test="task-description"]',
        '.cu-task-description-content'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent.trim();
        }
      }
      
      return null;
    }
    
    // UI methods
    showStatus(message, type) {
      const status = this.widget.querySelector('#claude-status');
      if (status) {
        status.textContent = message;
        status.className = 'claude-status ' + type;
        status.style.display = 'block';
        
        if (type !== 'loading') {
          setTimeout(() => {
            status.style.display = 'none';
          }, 3000);
        }
      }
    }
    
    showResult(response, action) {
      const result = this.widget.querySelector('#claude-result');
      if (!result) return;
      
      let html = '';
      
      if (action === 'create') {
        html = `
          <div class="claude-result-header">✅ Task Created</div>
          <div class="claude-result-content">
            <strong>Name:</strong> ${response.task.name}<br>
            <strong>ID:</strong> ${response.task.id}
            ${response.task.url ? `<br><a href="${response.task.url}" target="_blank">🔗 Open Task</a>` : ''}
          </div>
          <div class="claude-ai-response">${response.claudeResponse}</div>
        `;
      } else if (action === 'analyze') {
        html = `
          <div class="claude-result-header">📊 Analysis Complete</div>
          <div class="claude-result-content">
            <strong>Task:</strong> ${response.task.name}<br>
            <strong>Status:</strong> ${response.task.status?.status || 'Unknown'}
          </div>
          <div class="claude-ai-response">${response.claudeResponse}</div>
        `;
      } else {
        html = `
          <div class="claude-result-header">🤖 AI Response</div>
          <div class="claude-ai-response">${response.claudeResponse || response.comment?.comment_text}</div>
        `;
      }
      
      html += `<button class="claude-copy-btn" onclick="window.claudeAIWidget.copyResponse('${(response.claudeResponse || '').replace(/'/g, "\\'")}')">📋 Copy</button>`;
      
      result.innerHTML = html;
      result.style.display = 'block';
      
      this.widget.querySelector('#claude-status').style.display = 'none';
    }
    
    hideResult() {
      const result = this.widget.querySelector('#claude-result');
      if (result) {
        result.style.display = 'none';
      }
    }
    
    copyResponse(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showStatus('📋 Copied to clipboard!', 'success');
      }).catch(() => {
        console.error('Failed to copy to clipboard');
      });
    }
    
    // Widget control methods
    show() {
      this.widget.style.display = 'block';
      this.isVisible = true;
    }
    
    hide() {
      this.widget.style.display = 'none';
      this.isVisible = false;
    }
    
    toggleMinimize() {
      const content = this.widget.querySelector('.claude-widget-content');
      const isMinimized = content.style.display === 'none';
      
      content.style.display = isMinimized ? 'block' : 'none';
      
      const minimizeBtn = this.widget.querySelector('.claude-widget-minimize');
      minimizeBtn.textContent = isMinimized ? '−' : '+';
    }
    
    // Make widget draggable
    makeDraggable() {
      const header = this.widget.querySelector('.claude-widget-header');
      let isDragging = false;
      let startX, startY, initialX, initialY;
      
      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = this.widget.offsetLeft;
        initialY = this.widget.offsetTop;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      const onMouseMove = (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        this.widget.style.left = (initialX + dx) + 'px';
        this.widget.style.top = (initialY + dy) + 'px';
        this.widget.style.right = 'auto';
        this.widget.style.bottom = 'auto';
      };
      
      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
    
    // Inject CSS styles
    injectStyles() {
      if (document.getElementById('claude-ai-widget-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'claude-ai-widget-styles';
      styles.textContent = `
        #${WIDGET_ID} {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          max-height: 80vh;
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          overflow: hidden;
          resize: both;
          min-width: 300px;
          min-height: 200px;
        }
        
        .claude-widget-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
        }
        
        .claude-widget-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        
        .claude-widget-controls {
          display: flex;
          gap: 5px;
        }
        
        .claude-widget-minimize,
        .claude-widget-close {
          background: none;
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
        }
        
        .claude-widget-minimize:hover,
        .claude-widget-close:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .claude-widget-content {
          padding: 16px;
          max-height: calc(80vh - 60px);
          overflow-y: auto;
        }
        
        .claude-tabs {
          display: flex;
          margin: -16px -16px 16px -16px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .claude-tab {
          flex: 1;
          padding: 10px 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          color: #666;
        }
        
        .claude-tab.active {
          background: white;
          color: #667eea;
          font-weight: 600;
        }
        
        .claude-tab:hover {
          background: #e9ecef;
        }
        
        .claude-tab-content {
          display: none;
        }
        
        .claude-tab-content.active {
          display: block;
        }
        
        .claude-quick-actions {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .claude-quick-btn {
          padding: 10px;
          border: 1px solid #e1e4e8;
          background: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          text-align: left;
          transition: all 0.2s;
        }
        
        .claude-quick-btn:hover {
          background: #e9ecef;
          border-color: #667eea;
        }
        
        .claude-quick-input {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .claude-form-group {
          margin-bottom: 12px;
        }
        
        .claude-widget-content textarea,
        .claude-widget-content input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e4e8;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          box-sizing: border-box;
        }
        
        .claude-widget-content textarea:focus,
        .claude-widget-content input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .claude-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .claude-btn-primary,
        .claude-btn-secondary {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .claude-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
        }
        
        .claude-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .claude-btn-secondary {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #e1e4e8;
        }
        
        .claude-btn-secondary:hover {
          background: #e9ecef;
        }
        
        .claude-status {
          margin: 12px 0;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          display: none;
        }
        
        .claude-status.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .claude-status.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .claude-status.loading {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .claude-result {
          margin-top: 12px;
          display: none;
        }
        
        .claude-result-header {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .claude-result-content {
          margin-bottom: 12px;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .claude-ai-response {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #667eea;
          white-space: pre-wrap;
          font-size: 12px;
          line-height: 1.5;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 8px;
        }
        
        .claude-copy-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        
        .claude-copy-btn:hover {
          background: #218838;
        }
        
        .claude-setup {
          text-align: center;
        }
        
        .claude-setup h3 {
          color: #333;
          margin-bottom: 8px;
        }
        
        .claude-setup p {
          color: #666;
          margin-bottom: 16px;
          font-size: 13px;
        }
        
        @media (max-width: 768px) {
          #${WIDGET_ID} {
            width: 90%;
            right: 5%;
            top: 10px;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
  }
  
  // Initialize the widget
  window.claudeAIWidget = new ClaudeAIWidget();
  
  console.log('Claude AI Widget loaded successfully! 🤖');
  
})();