const crypto = require('crypto');

// API Key authentication middleware
const authenticateRequest = (req, res, next) => {
  // Skip auth in development mode unless API_KEY is set
  if (process.env.NODE_ENV !== 'production' && !process.env.API_KEY) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

// Webhook signature verification
const verifyWebhookSignature = (req, res, next) => {
  // Skip verification if no secret is configured
  if (!process.env.WEBHOOK_SECRET) {
    console.warn('Warning: Webhook signature verification disabled - no WEBHOOK_SECRET configured');
    return next();
  }

  const signature = req.headers['x-signature'] || req.headers['x-clickup-signature'];
  
  if (!signature) {
    return res.status(401).json({ error: 'Webhook signature required' });
  }

  // Calculate expected signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Compare signatures
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
};

module.exports = {
  authenticateRequest,
  verifyWebhookSignature
};