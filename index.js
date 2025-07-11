const express = require('express');
const config = require('./src/config/config');
const integrationController = require('./src/controllers/integrationController');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Claude-ClickUp Integration API is running' });
});

// Integration endpoints
app.post('/api/claude-to-clickup', integrationController.claudeToClickUp);
app.post('/api/clickup-to-claude', integrationController.clickUpToClaude);
app.post('/api/webhook/clickup', integrationController.clickUpWebhook);

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