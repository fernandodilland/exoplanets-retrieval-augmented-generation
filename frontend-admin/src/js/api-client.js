/**
 * API Client for Admin Frontend
 * Handles all API requests with authentication
 */

/**
 * Login to the API
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} turnstileToken - Turnstile token (optional, can be in header)
 * @returns {Promise<object>} Response with access_token
 */
async function login(username, password, turnstileToken = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add Turnstile token to headers if provided
        if (turnstileToken) {
            headers['cf-turnstile-response'] = turnstileToken;
        }
        
        const response = await fetch(getApiUrl('LOGIN'), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                user: username,
                password: password
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Upload a file to the API
 * @param {File} file - File to upload
 * @param {function} onProgress - Progress callback (optional)
 * @returns {Promise<object>} Upload response
 */
async function uploadFile(file, onProgress = null) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = {
            ...getAuthHeaders()
        };
        
        // Don't set Content-Type header for FormData, browser will set it with boundary
        
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            // Progress event
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                });
            }
            
            // Load event
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve({
                            success: true,
                            data: data
                        });
                    } catch (error) {
                        reject({
                            success: false,
                            error: 'Invalid JSON response'
                        });
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject({
                            success: false,
                            error: error.detail || `Upload failed: ${xhr.status}`
                        });
                    } catch (e) {
                        reject({
                            success: false,
                            error: `Upload failed: ${xhr.status}`
                        });
                    }
                }
            });
            
            // Error event
            xhr.addEventListener('error', () => {
                reject({
                    success: false,
                    error: 'Network error during upload'
                });
            });
            
            // Open and send request
            xhr.open('POST', getApiUrl('UPLOAD'));
            
            // Set authorization header
            Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
            
            xhr.send(formData);
        });
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send AI request to the API
 * @param {string} question - Question to ask
 * @returns {Promise<object>} AI response
 */
async function sendAIRequest(question) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        };
        
        const response = await fetch(getApiUrl('REQUEST'), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                question: question
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `AI request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('AI request error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all files from the API
 * @returns {Promise<object>} Files list
 */
async function getFiles() {
    try {
        const headers = {
            ...getAuthHeaders()
        };
        
        const response = await fetch(getApiUrl('FILES'), {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Failed to fetch files: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Get files error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all AI results from the API
 * @returns {Promise<object>} Results list
 */
async function getResults() {
    try {
        const headers = {
            ...getAuthHeaders()
        };
        
        const response = await fetch(getApiUrl('RESULTS'), {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Failed to fetch results: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Get results error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check API health
 * @returns {Promise<object>} Health status
 */
async function checkHealth() {
    try {
        const response = await fetch(getApiUrl('HEALTH'), {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Health check error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        uploadFile,
        sendAIRequest,
        getFiles,
        getResults,
        checkHealth
    };
}
