/**
 * Authentication Utilities
 * Handles JWT token storage in secure cookies
 */

const TOKEN_COOKIE_NAME = 'auth_token';

/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Save JWT token in a secure cookie
 * @param {string} token - JWT token
 * @returns {boolean} Success status
 */
function saveToken(token) {
    try {
        // Decode token to get expiration
        const payload = decodeJWT(token);
        if (!payload || !payload.exp) {
            console.error('Invalid token: missing expiration');
            return false;
        }
        
        // Calculate expiration date from token payload
        const expirationDate = new Date(payload.exp * 1000); // exp is in seconds
        
        // Set cookie with expiration
        // HttpOnly cannot be set via JavaScript for security, but we set Secure and SameSite
        const cookieOptions = [
            `${TOKEN_COOKIE_NAME}=${token}`,
            `expires=${expirationDate.toUTCString()}`,
            'path=/',
            'SameSite=Strict'
        ];
        
        // Add Secure flag if using HTTPS
        if (window.location.protocol === 'https:') {
            cookieOptions.push('Secure');
        }
        
        document.cookie = cookieOptions.join('; ');
        
        console.log('Token saved successfully, expires at:', expirationDate);
        return true;
    } catch (error) {
        console.error('Error saving token:', error);
        return false;
    }
}

/**
 * Get JWT token from cookie
 * @returns {string|null} Token or null if not found
 */
function getToken() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(cookie => cookie.startsWith(`${TOKEN_COOKIE_NAME}=`));
    
    if (!tokenCookie) {
        return null;
    }
    
    const token = tokenCookie.split('=')[1];
    
    // Check if token is expired
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
        removeToken();
        return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
        console.log('Token expired');
        removeToken();
        return null;
    }
    
    return token;
}

/**
 * Remove JWT token from cookie (logout)
 */
function removeToken() {
    const cookieOptions = [
        `${TOKEN_COOKIE_NAME}=`,
        'expires=Thu, 01 Jan 1970 00:00:00 UTC',
        'path=/'
    ];
    
    document.cookie = cookieOptions.join('; ');
    console.log('Token removed');
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
    const token = getToken();
    return token !== null;
}

/**
 * Get user information from token
 * @returns {object|null} User info or null if not authenticated
 */
function getUserInfo() {
    const token = getToken();
    if (!token) {
        return null;
    }
    
    const payload = decodeJWT(token);
    if (!payload) {
        return null;
    }
    
    return {
        userId: payload.user_id,
        username: payload.sub,
        expiresAt: new Date(payload.exp * 1000)
    };
}

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization
 */
function getAuthHeaders() {
    const token = getToken();
    if (!token) {
        return {};
    }
    
    return {
        'Authorization': `Bearer ${token}`
    };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToken,
        getToken,
        removeToken,
        isAuthenticated,
        getUserInfo,
        getAuthHeaders,
        decodeJWT
    };
}
