// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    if (isAuthenticated()) {
        console.log('User already authenticated, redirecting to dashboard...');
        window.location.href = '../index.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Get Turnstile token
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]');
        
        if (!turnstileToken || !turnstileToken.value) {
            showMessage('Please complete the CAPTCHA verification', 'error');
            return;
        }
        
        // Show authenticating message
        showMessage('Authenticating...', 'info');
        
        try {
            // Call login API
            const result = await login(username, password, turnstileToken.value);
            
            if (result.success) {
                // Save token to cookie
                const tokenSaved = saveToken(result.data.access_token);
                
                if (tokenSaved) {
                    showMessage('Login successful! Redirecting...', 'success');
                    
                    // Get user info from token
                    const userInfo = getUserInfo();
                    console.log('Logged in as:', userInfo.username);
                    
                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                } else {
                    showMessage('Failed to save authentication token', 'error');
                }
            } else {
                showMessage(result.error || 'Invalid credentials', 'error');
                
                // Reset Turnstile widget if available
                if (typeof turnstile !== 'undefined') {
                    turnstile.reset();
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred during login. Please try again.', 'error');
            
            // Reset Turnstile widget if available
            if (typeof turnstile !== 'undefined') {
                turnstile.reset();
            }
        }
    });
    
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type} fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up`;
        
        const bgColors = {
            success: 'bg-green-500/20 border border-green-500 text-green-300',
            error: 'bg-red-500/20 border border-red-500 text-red-300',
            info: 'bg-blue-500/20 border border-blue-500 text-blue-300'
        };
        
        messageDiv.className += ' ' + bgColors[type];
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
});
