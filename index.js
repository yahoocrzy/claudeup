const express = require('express');
const config = require('./src/config/config');
const integrationController = require('./src/controllers/integrationController');

const app = express();

// Basic Auth (username/password) middleware
const authenticateRequest = (req, res, next) => {
  // Skip auth if no credentials are configured
  if (!config.auth.username || !config.auth.password) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      error: 'Authentication required. Use Basic Auth with username and password.',
      hint: 'Include Authorization: Basic <base64(username:password)> header'
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== config.auth.username || password !== config.auth.password) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  next();
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Claude-ClickUp Integration API is running' });
});

// Integration endpoints (protected with API key if configured)
app.post('/api/claude-to-clickup', authenticateRequest, integrationController.claudeToClickUp);
app.post('/api/clickup-to-claude', authenticateRequest, integrationController.clickUpToClaude);
app.post('/api/webhook/clickup', integrationController.clickUpWebhook); // Webhooks don't need auth

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Claude-ClickUp Integration API running on port ${PORT}`);
});