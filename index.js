const express = require('express');
const config = require('./src/config/config');
const integrationController = require('./src/controllers/integrationController');

const app = express();

// Simple API key authentication middleware
const authenticateRequest = (req, res, next) => {
  // Skip auth if no API_KEY is configured
  if (!config.apiKey) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Include X-API-Key header.' });
  }

  if (apiKey !== config.apiKey) {
    return res.status(401).json({ error: 'Invalid API key.' });
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