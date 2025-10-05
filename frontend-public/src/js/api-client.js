/**
 * API Client for Public Frontend
 * Handles all public API requests (no authentication required)
 */

/**
 * Get paginated list of files
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<object>} Files list
 */
async function getFiles(page = 1, pageSize = 20) {
    try {
        const url = `${getApiUrl('FILES')}?page=${page}&page_size=${pageSize}`;
        
        const response = await fetch(url, {
            method: 'GET'
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
 * Get total count of files
 * @returns {Promise<object>} Files count
 */
async function getFilesCount() {
    try {
        const url = `${getApiUrl('FILES')}/count`;
        
        const response = await fetch(url, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Failed to fetch files count: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Get files count error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get paginated list of AI results
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<object>} Results list
 */
async function getResults(page = 1, pageSize = 20) {
    try {
        const url = `${getApiUrl('RESULTS')}?page=${page}&page_size=${pageSize}`;
        
        const response = await fetch(url, {
            method: 'GET'
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
 * Get total count of AI results
 * @returns {Promise<object>} Results count
 */
async function getResultsCount() {
    try {
        const url = `${getApiUrl('RESULTS')}/count`;
        
        const response = await fetch(url, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Failed to fetch results count: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Get results count error:', error);
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
        getFiles,
        getFilesCount,
        getResults,
        getResultsCount,
        checkHealth
    };
}
