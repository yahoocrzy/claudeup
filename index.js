const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/config');
const integrationController = require('./src/controllers/integrationController');
const { validateEnv } = require('./src/utils/validation');
const { authenticateRequest } = require('./src/middleware/auth');

// Validate environment variables (temporarily disabled for debugging)
// validateEnv();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Claude-ClickUp Integration API is running' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running and routes are working' });
});

// Setup helper endpoint (no auth required for initial setup)
app.get('/api/setup/lists', integrationController.getSetupLists);

// Helper endpoints (no auth for web interface)
app.get('/api/lists', integrationController.getAllLists);
app.get('/api/workspace-info', integrationController.getWorkspaceInfo);

// Integration endpoints (no auth for web interface)
app.post('/api/claude-to-clickup', integrationController.claudeToClickUp);
app.post('/api/clickup-to-claude', integrationController.clickUpToClaude);
app.post('/api/webhook/clickup', integrationController.clickUpWebhook); // Webhook uses signature verification instead

// 404 handler for debugging
app.use('*', (req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /health',
      'GET /test',
      'GET /api/setup/lists',
      'POST /api/claude-to-clickup',
      'POST /api/clickup-to-claude'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Claude-ClickUp Integration API running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- GET /test'); 
  console.log('- GET /api/setup/lists');
  console.log('- POST /api/claude-to-clickup');
  console.log('- POST /api/clickup-to-claude');
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});