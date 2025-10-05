/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Update the API_BASE_URL to point to your backend server
 */

// API Base URL - Change this to your production URL when deploying
const API_BASE_URL = 'https://api-exoplanets.fernandodilland.com';

// API Endpoints
const API_ENDPOINTS = {
    // File Management (Public)
    FILES: '/api/files',
    
    // Results (Public)
    RESULTS: '/api/results',
    
    // Health Check
    HEALTH: '/health',
    ROOT: '/'
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - The endpoint key from API_ENDPOINTS
 * @returns {string} Full URL
 */
function getApiUrl(endpoint) {
    const path = API_ENDPOINTS[endpoint];
    if (!path) {
        console.error(`Unknown endpoint: ${endpoint}`);
        return API_BASE_URL;
    }
    return `${API_BASE_URL}${path}`;
}

/**
 * Get API base URL
 * @returns {string} Base URL
 */
function getApiBaseUrl() {
    return API_BASE_URL;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        API_ENDPOINTS,
        getApiUrl,
        getApiBaseUrl
    };
}
