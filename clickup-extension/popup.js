// Claude AI ClickUp Extension - Popup Script

document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const status = document.getElementById('status');

    // Load saved credentials
    loadCredentials();

    // Event listeners
    saveBtn.addEventListener('click', saveCredentials);
    testBtn.addEventListener('click', testConnection);
    
    // Enter key handling
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveCredentials();
        }
    });

    async function loadCredentials() {
        try {
            const result = await chrome.storage.sync.get(['username', 'password']);
            if (result.username) {
                usernameInput.value = result.username;
            }
            if (result.password) {
                passwordInput.value = result.password;
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    }

    async function saveCredentials() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showStatus('Please enter both username and password', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({
                username: username,
                password: password
            });

            showStatus('✅ Credentials saved successfully!', 'success');
            
            // Test the connection after saving
            setTimeout(testConnection, 1000);
        } catch (error) {
            showStatus('❌ Error saving credentials', 'error');
            console.error('Error saving credentials:', error);
        }
    }

    async function testConnection() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showStatus('Please enter credentials first', 'error');
            return;
        }

        showStatus('🔄 Testing connection...', 'info');
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';

        try {
            const credentials = btoa(`${username}:${password}`);
            const response = await fetch('https://claudeup.onrender.com/health', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                showStatus('✅ Connection successful!', 'success');
                
                // Try a test API call
                await testAPICall(credentials);
            } else {
                if (response.status === 401) {
                    showStatus('❌ Invalid credentials', 'error');
                } else {
                    showStatus(`❌ Connection failed (${response.status})`, 'error');
                }
            }
        } catch (error) {
            showStatus('❌ Network error - check your connection', 'error');
            console.error('Connection test error:', error);
        }

        testBtn.disabled = false;
        testBtn.textContent = 'Test';
    }

    async function testAPICall(credentials) {
        try {
            const response = await fetch('https://claudeup.onrender.com/api/claude-to-clickup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`
                },
                body: JSON.stringify({
                    prompt: 'Test connection - create a simple test task'
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showStatus('✅ API test successful! Extension ready to use.', 'success');
                } else {
                    showStatus('⚠️ API responded but task creation may have issues', 'error');
                }
            } else {
                showStatus('⚠️ API connection issues detected', 'error');
            }
        } catch (error) {
            showStatus('⚠️ API test failed - but basic connection works', 'error');
            console.error('API test error:', error);
        }
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';

        // Hide status after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }

    // Add info status type
    const style = document.createElement('style');
    style.textContent = `
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    `;
    document.head.appendChild(style);
});