# Deployment Guide

This guide covers multiple ways to deploy your Claude-ClickUp integration online.

## 🚀 Quick Deployment Options

### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. **Fork/Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/claude-clickup-integration.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add environment variables in the Render dashboard:
     - `CLAUDE_API_KEY`
     - `CLICKUP_API_TOKEN`
     - `CLICKUP_WORKSPACE_ID`
     - `CLICKUP_LIST_ID`
     - `WEBHOOK_SECRET` (optional)

3. **Your API will be available at**: `https://your-app-name.onrender.com`

### Option 2: Deploy to Railway (Simple & Fast)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway up
   ```

3. **Set environment variables**:
   ```bash
   railway variables set CLAUDE_API_KEY=your_key
   railway variables set CLICKUP_API_TOKEN=your_token
   railway variables set CLICKUP_WORKSPACE_ID=your_workspace_id
   railway variables set CLICKUP_LIST_ID=your_list_id
   ```

4. **Get your URL**:
   ```bash
   railway open
   ```

### Option 3: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables**:
   ```bash
   vercel env add CLAUDE_API_KEY
   vercel env add CLICKUP_API_TOKEN
   vercel env add CLICKUP_WORKSPACE_ID
   vercel env add CLICKUP_LIST_ID
   ```

### Option 4: Deploy to Heroku

1. **Create `Procfile`** (already included)

2. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set CLAUDE_API_KEY=your_key
   heroku config:set CLICKUP_API_TOKEN=your_token
   heroku config:set CLICKUP_WORKSPACE_ID=your_workspace_id
   heroku config:set CLICKUP_LIST_ID=your_list_id
   ```

### Option 5: Deploy to Replit

1. **Import on Replit**:
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Add your repository URL

2. **Set environment variables**:
   - Use Replit's Secrets tab to add your API keys

3. **Run the project**:
   - Click "Run" button
   - Your API will be available at: `https://your-repl-name.your-username.repl.co`

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use platform-specific environment variables
2. **Use HTTPS** - All platforms above provide HTTPS by default
3. **Set up CORS** if needed for frontend access
4. **Implement rate limiting** for production use

## 🔄 Continuous Deployment with GitHub Actions

The project includes GitHub Actions workflows for automatic deployment:

1. **Set up secrets in GitHub**:
   - Go to Settings → Secrets → Actions
   - Add deployment tokens for your chosen platform:
     - `RENDER_DEPLOY_HOOK_URL` for Render
     - `RAILWAY_TOKEN` for Railway
     - `VERCEL_TOKEN` for Vercel

2. **Push to main branch** to trigger automatic deployment

## 📊 Monitoring Your Deployment

### Health Check Endpoint
All deployments include a health check at:
```
GET https://your-domain.com/health
```

### Logging
View logs on your hosting platform:
- Render: Dashboard → Logs
- Railway: Dashboard → Deployments → View Logs
- Vercel: Dashboard → Functions → Logs
- Heroku: `heroku logs --tail`

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot find module" errors**:
   - Ensure all dependencies are in `package.json`
   - Check that `npm install` runs during build

2. **API Key errors**:
   - Verify environment variables are set correctly
   - Check for typos in variable names

3. **Port binding errors**:
   - Most platforms set `PORT` automatically
   - Our app uses `process.env.PORT || 3000`

### Platform-Specific Issues

**Render**: 
- Free tier spins down after inactivity (first request may be slow)
- Use "Background Worker" for always-on requirements

**Vercel**:
- Has 10-second timeout for API routes
- Best for lightweight operations

**Railway**:
- Requires valid payment method (but has free tier)
- Excellent for always-on services

## 📱 Setting Up Webhooks

After deployment, update your ClickUp webhook URL:

1. Go to ClickUp Settings → Integrations → Webhooks
2. Update webhook URL to: `https://your-domain.com/api/webhook/clickup`
3. Test the webhook with ClickUp's test feature

## 🎉 Next Steps

1. Test your deployed API with the endpoints
2. Set up monitoring (e.g., UptimeRobot)
3. Configure custom domain (if needed)
4. Implement additional security measures

## Need Help?

- Check platform-specific documentation
- Review deployment logs
- Ensure all environment variables are set
- Verify API keys are valid and have correct permissions