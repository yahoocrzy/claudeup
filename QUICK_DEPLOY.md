# Quick Deploy to Render (Free)

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/claude-clickup.git
git push -u origin main
```

## 2. Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select your repository
4. Fill in:
   - **Name**: claude-clickup-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   CLICKUP_API_TOKEN = pk_100070024_QDZNZISNLY7SHBI3RGFDGUX3J73AB5WX
   CLICKUP_WORKSPACE_ID = 90131200859
   CLICKUP_LIST_ID = 86a9z79jh
   CLAUDE_API_KEY = (you still need to add this)
   NODE_ENV = production
   API_KEY = (generate a 32+ character key for API authentication)
   ```

6. Click "Create Web Service"

## 3. Find Your Lists (After Deploy)

Once deployed, visit:
```
https://your-app-name.onrender.com/api/setup/lists
```

This will show all your available lists and their IDs.

## 4. Test Your API

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Create a task (after adding Claude API key)
curl -X POST https://your-app-name.onrender.com/api/claude-to-clickup \
  -H "X-API-Key: your_api_key_from_step_5" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a task for testing the API"}'
```

## Quick Alternative: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Add environment variables in Railway dashboard
railway open
```

Then add all the environment variables in the Railway dashboard.

## Notes

- The `/api/setup/lists` endpoint works without authentication to help you find list IDs
- Remember to add your Claude API key to make the integration fully functional
- For production, generate a secure API_KEY for authentication
- Free Render tier may sleep after inactivity (first request will be slow)