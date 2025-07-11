// Claude AI ClickUp Bookmarklet - No Extension Required
// Save this as a bookmark in your browser

javascript:(function() {
  // Configuration
  const API_URL = 'https://claudeup.onrender.com';
  const TEAM_USERNAME = 'teamuser';
  const TEAM_PASSWORD = 'teampass123';
  
  // Check if we're on ClickUp
  if (!window.location.href.includes('app.clickup.com')) {
    alert('This bookmarklet only works on ClickUp! Please navigate to app.clickup.com first.');
    return;
  }
  
  // Check if already loaded
  if (window.claudeAI) {
    window.claudeAI.toggle();
    return;
  }
  
  // Create Claude AI integration
  window.claudeAI = {
    isVisible: false,
    credentials: btoa(TEAM_USERNAME + ':' + TEAM_PASSWORD),
    
    // Main toggle function
    toggle: function() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    },
    
    // Show AI assistant
    show: function() {
      if (document.getElementById('claude-ai-widget')) return;
      
      this.createWidget();
      this.injectStyles();
      this.isVisible = true;
    },
    
    // Hide AI assistant
    hide: function() {
      const widget = document.getElementById('claude-ai-widget');
      if (widget) widget.remove();
      this.isVisible = false;
    },
    
    // Create the main widget
    createWidget: function() {
      const widget = document.createElement('div');
      widget.id = 'claude-ai-widget';
      widget.innerHTML = `
        <div class="claude-header">
          <h3>🤖 Claude AI Assistant</h3>
          <button class="claude-close" onclick="window.claudeAI.hide()">×</button>
        </div>
        <div class="claude-tabs">
          <button class="claude-tab active" data-tab="create">Create Task</button>
          <button class="claude-tab" data-tab="analyze">Analyze</button>
          <button class="claude-tab" data-tab="enhance">Enhance</button>
        </div>
        
        <!-- Create Task Tab -->
        <div class="claude-content" id="claude-create">
          <textarea id="claude-prompt" placeholder="Describe what you want to create...
Examples:
• Create a user authentication system
• Build a REST API for orders
• Design a responsive dashboard"></textarea>
          <div class="claude-actions">
            <button class="claude-btn-primary" onclick="window.claudeAI.createTask()">
              ✨ Create AI Task
            </button>
            <button class="claude-btn-secondary" onclick="window.claudeAI.quickCreate()">
              ⚡ Quick Create
            </button>
          </div>
        </div>
        
        <!-- Analyze Tab -->
        <div class="claude-content" id="claude-analyze" style="display:none">
          <input type="text" id="claude-task-url" placeholder="Paste ClickUp task URL or ID here">
          <div class="claude-actions">
            <button class="claude-btn-primary" onclick="window.claudeAI.analyzeTask()">
              📊 Analyze Task
            </button>
            <button class="claude-btn-secondary" onclick="window.claudeAI.getCurrentTask()">
              📍 Use Current Task
            </button>
          </div>
        </div>
        
        <!-- Enhance Tab -->
        <div class="claude-content" id="claude-enhance" style="display:none">
          <textarea id="claude-enhance-text" placeholder="Paste task description to enhance..."></textarea>
          <div class="claude-actions">
            <button class="claude-btn-primary" onclick="window.claudeAI.enhanceDescription()">
              🚀 Enhance Description
            </button>
            <button class="claude-btn-secondary" onclick="window.claudeAI.addToCurrentTask()">
              📝 Add to Current Task
            </button>
          </div>
        </div>
        
        <div class="claude-status" id="claude-status"></div>
        <div class="claude-result" id="claude-result"></div>
      `;
      
      document.body.appendChild(widget);
      this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners: function() {
      // Tab switching
      document.querySelectorAll('.claude-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          document.querySelectorAll('.claude-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.claude-content').forEach(c => c.style.display = 'none');
          
          e.target.classList.add('active');
          document.getElementById('claude-' + e.target.dataset.tab).style.display = 'block';
        });
      });
      
      // Enter key handling
      document.getElementById('claude-prompt').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          this.createTask();
        }
      });
    },
    
    // Create task from prompt
    createTask: async function() {
      const prompt = document.getElementById('claude-prompt').value.trim();
      if (!prompt) {
        this.showStatus('Please enter a task description', 'error');
        return;
      }
      
      this.showStatus('🤖 Creating task with AI...', 'loading');
      
      try {
        const response = await fetch(API_URL + '/api/claude-to-clickup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + this.credentials
          },
          body: JSON.stringify({ prompt: prompt })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showResult(`
            <div class="success-result">
              <h4>✅ Task Created Successfully!</h4>
              <p><strong>Name:</strong> ${result.task.name}</p>
              <p><strong>ID:</strong> ${result.task.id}</p>
              ${result.task.url ? `<p><a href="${result.task.url}" target="_blank">🔗 Open in ClickUp</a></p>` : ''}
              <div class="ai-description">
                <strong>AI Description:</strong>
                <div class="description-content">${result.claudeResponse}</div>
              </div>
              <button onclick="navigator.clipboard.writeText('${result.claudeResponse.replace(/'/g, "\\'")}')">📋 Copy Description</button>
            </div>
          `);
          document.getElementById('claude-prompt').value = '';
        } else {
          this.showStatus('❌ Error: ' + (result.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    },
    
    // Quick create without AI enhancement
    quickCreate: async function() {
      const prompt = document.getElementById('claude-prompt').value.trim();
      if (!prompt) {
        this.showStatus('Please enter a task description', 'error');
        return;
      }
      
      // Use ClickUp's own task creation if possible
      this.fillClickUpTaskForm(prompt);
      this.showStatus('✅ Task details filled in ClickUp form', 'success');
    },
    
    // Analyze existing task
    analyzeTask: async function() {
      const input = document.getElementById('claude-task-url').value.trim();
      if (!input) {
        this.showStatus('Please enter a task URL or ID', 'error');
        return;
      }
      
      const taskId = this.extractTaskId(input);
      if (!taskId) {
        this.showStatus('Could not extract task ID from input', 'error');
        return;
      }
      
      this.showStatus('🤖 Analyzing task...', 'loading');
      
      try {
        const response = await fetch(API_URL + '/api/clickup-to-claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + this.credentials
          },
          body: JSON.stringify({ taskId: taskId, action: 'analyze' })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showResult(`
            <div class="analysis-result">
              <h4>📊 Task Analysis</h4>
              <p><strong>Task:</strong> ${result.task.name}</p>
              <p><strong>Status:</strong> ${result.task.status?.status || 'Unknown'}</p>
              <div class="ai-analysis">
                <strong>AI Analysis:</strong>
                <div class="analysis-content">${result.claudeResponse}</div>
              </div>
              <button onclick="navigator.clipboard.writeText('${result.claudeResponse.replace(/'/g, "\\'")}')">📋 Copy Analysis</button>
            </div>
          `);
        } else {
          this.showStatus('❌ Error: ' + (result.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    },
    
    // Get current task from URL
    getCurrentTask: function() {
      const taskId = this.extractTaskId(window.location.href);
      if (taskId) {
        document.getElementById('claude-task-url').value = taskId;
        this.analyzeTask();
      } else {
        this.showStatus('No task found in current URL', 'error');
      }
    },
    
    // Enhance description
    enhanceDescription: async function() {
      const text = document.getElementById('claude-enhance-text').value.trim();
      if (!text) {
        this.showStatus('Please enter text to enhance', 'error');
        return;
      }
      
      this.showStatus('🤖 Enhancing with AI...', 'loading');
      
      try {
        const response = await fetch(API_URL + '/api/claude-to-clickup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + this.credentials
          },
          body: JSON.stringify({ 
            prompt: `Enhance and expand this task description with detailed requirements, acceptance criteria, and implementation notes: "${text}"` 
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showResult(`
            <div class="enhance-result">
              <h4>🚀 Enhanced Description</h4>
              <div class="enhanced-content">${result.claudeResponse}</div>
              <div class="enhance-actions">
                <button onclick="navigator.clipboard.writeText('${result.claudeResponse.replace(/'/g, "\\'")}')">📋 Copy Enhanced</button>
                <button onclick="window.claudeAI.replaceText('${result.claudeResponse.replace(/'/g, "\\'")}')">📝 Replace Original</button>
              </div>
            </div>
          `);
        } else {
          this.showStatus('❌ Error: ' + (result.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    },
    
    // Add enhanced description to current task
    addToCurrentTask: function() {
      const taskId = this.extractTaskId(window.location.href);
      if (!taskId) {
        this.showStatus('No current task found', 'error');
        return;
      }
      
      const text = document.getElementById('claude-enhance-text').value.trim();
      if (!text) {
        this.showStatus('Please enter text to enhance', 'error');
        return;
      }
      
      // Enhance and add as comment
      this.addAIComment(taskId, text);
    },
    
    // Add AI comment to task
    addAIComment: async function(taskId, text) {
      this.showStatus('🤖 Adding AI comment...', 'loading');
      
      try {
        const response = await fetch(API_URL + '/api/claude-to-clickup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + this.credentials
          },
          body: JSON.stringify({ 
            prompt: `Provide helpful insights and recommendations for: "${text}"`,
            taskId: taskId
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showStatus('✅ AI comment added to task!', 'success');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          this.showStatus('❌ Error: ' + (result.error || 'Unknown error'), 'error');
        }
      } catch (error) {
        this.showStatus('❌ Network error: ' + error.message, 'error');
      }
    },
    
    // Utility functions
    extractTaskId: function(input) {
      // Extract from URL like https://app.clickup.com/t/taskid
      const urlMatch = input.match(/\/t\/([a-zA-Z0-9]+)/);
      if (urlMatch) return urlMatch[1];
      
      // Return as-is if it looks like a task ID
      if (/^[a-zA-Z0-9]+$/.test(input)) return input;
      
      return null;
    },
    
    fillClickUpTaskForm: function(text) {
      // Try to find and fill ClickUp task input fields
      const selectors = [
        '[data-test="task-name-input"]',
        '.task-name-input',
        '[placeholder*="task"]',
        '[placeholder*="Task"]',
        'input[type="text"]'
      ];
      
      for (const selector of selectors) {
        const input = document.querySelector(selector);
        if (input && input.offsetParent !== null) {
          input.value = text;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
          return true;
        }
      }
      
      // If no form found, copy to clipboard
      navigator.clipboard.writeText(text);
      return false;
    },
    
    replaceText: function(newText) {
      document.getElementById('claude-enhance-text').value = newText;
      this.showStatus('✅ Text replaced!', 'success');
    },
    
    showStatus: function(message, type) {
      const status = document.getElementById('claude-status');
      status.textContent = message;
      status.className = 'claude-status ' + type;
      status.style.display = 'block';
      
      if (type === 'success' || type === 'error') {
        setTimeout(() => {
          status.style.display = 'none';
        }, 3000);
      }
    },
    
    showResult: function(html) {
      const result = document.getElementById('claude-result');
      result.innerHTML = html;
      result.style.display = 'block';
      document.getElementById('claude-status').style.display = 'none';
    },
    
    // Inject CSS styles
    injectStyles: function() {
      if (document.getElementById('claude-ai-styles')) return;
      
      const styles = document.createElement('style');
      styles.id = 'claude-ai-styles';
      styles.textContent = `
        #claude-ai-widget {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
          max-height: 80vh;
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }
        
        .claude-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .claude-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .claude-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .claude-close:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .claude-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .claude-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .claude-tab.active {
          background: white;
          color: #667eea;
          font-weight: 600;
        }
        
        .claude-tab:hover {
          background: #e9ecef;
        }
        
        .claude-content {
          padding: 20px;
        }
        
        .claude-content textarea,
        .claude-content input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e4e8;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 15px;
          box-sizing: border-box;
          font-family: inherit;
        }
        
        .claude-content textarea {
          height: 120px;
          resize: vertical;
        }
        
        .claude-content textarea:focus,
        .claude-content input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .claude-actions {
          display: flex;
          gap: 10px;
        }
        
        .claude-btn-primary,
        .claude-btn-secondary {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }
        
        .claude-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
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
          margin: 0 20px 20px 20px;
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
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
          margin: 0 20px 20px 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 14px;
          max-height: 300px;
          overflow-y: auto;
          display: none;
        }
        
        .claude-result h4 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .claude-result .description-content,
        .claude-result .analysis-content,
        .claude-result .enhanced-content {
          background: white;
          padding: 12px;
          border-radius: 4px;
          margin: 10px 0;
          white-space: pre-wrap;
          border-left: 3px solid #667eea;
        }
        
        .claude-result button {
          background: #667eea;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          margin: 5px 5px 0 0;
        }
        
        .claude-result button:hover {
          background: #5a6fd8;
        }
        
        .claude-result a {
          color: #667eea;
          text-decoration: none;
        }
        
        .enhance-actions {
          margin-top: 10px;
        }
        
        @media (max-width: 768px) {
          #claude-ai-widget {
            width: 95%;
            right: 2.5%;
            top: 10px;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
  };
  
  // Show the widget
  window.claudeAI.show();
  
})();