// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Get Turnstile token
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]');
        
        if (!turnstileToken || !turnstileToken.value) {
            showMessage('Please complete the CAPTCHA verification', 'error');
            return;
        }
        
        // Dummy authentication - Replace with actual API call
        console.log('Login attempt:', { username, password, turnstileToken: turnstileToken.value });
        
        // Simulate API call
        showMessage('Authenticating...', 'info');
        
        setTimeout(() => {
            // Dummy validation
            if (username && password) {
                // In production, validate credentials with backend
                showMessage('Login successful! Redirecting...', 'success');
                
                // Store session (dummy)
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('username', username);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                showMessage('Invalid credentials', 'error');
            }
        }, 1000);
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
