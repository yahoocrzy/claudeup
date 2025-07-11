const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setup() {
  console.log('\n🚀 Claude-ClickUp Integration Setup\n');
  console.log('This wizard will help you configure your API credentials.\n');

  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  // Collect Claude API Key
  console.log('\n📝 Claude AI Configuration');
  console.log('Get your API key from: https://console.anthropic.com/');
  const claudeApiKey = await question('Enter your Claude API key (sk-ant-...): ');

  // Collect ClickUp credentials
  console.log('\n📋 ClickUp Configuration');
  console.log('Get your API token from: ClickUp Settings > Apps > API Token');
  const clickupToken = await question('Enter your ClickUp API token (pk_...): ');
  
  console.log('\nTo find your Workspace ID:');
  console.log('1. Open ClickUp and go to Settings > Workspaces');
  console.log('2. Click on your workspace name');
  console.log('3. The ID is in the URL: app.clickup.com/[WORKSPACE_ID]/...');
  const workspaceId = await question('Enter your ClickUp Workspace ID: ');

  console.log('\nTo find a List ID:');
  console.log('1. Open any list in ClickUp');
  console.log('2. Check the URL: app.clickup.com/.../v/li/[LIST_ID]');
  const listId = await question('Enter your default ClickUp List ID: ');

  // Optional settings
  const port = await question('\nServer port (default: 3000): ') || '3000';
  const webhookSecret = await question('Webhook secret (optional, press Enter to skip): ');

  // Create .env content
  const envContent = `# Claude AI Configuration
CLAUDE_API_KEY=${claudeApiKey}

# ClickUp Configuration
CLICKUP_API_TOKEN=${clickupToken}
CLICKUP_WORKSPACE_ID=${workspaceId}
CLICKUP_LIST_ID=${listId}

# Server Configuration
PORT=${port}

# Webhook Configuration (optional)
WEBHOOK_SECRET=${webhookSecret}
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Configuration saved to .env file');

  // Verify API keys format
  const warnings = [];
  if (!claudeApiKey.startsWith('sk-ant-')) {
    warnings.push('⚠️  Claude API key should start with "sk-ant-"');
  }
  if (!clickupToken.startsWith('pk_')) {
    warnings.push('⚠️  ClickUp token should start with "pk_"');
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(w));
  }

  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   npm start      - To start the server');
  console.log('   npm run dev    - To start in development mode\n');

  rl.close();
}

// Run setup
setup().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});