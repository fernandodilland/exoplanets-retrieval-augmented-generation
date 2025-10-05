// JavaScript for additional site functionalities

// State management
let currentFilesPage = 1;
let currentResultsPage = 1;
const itemsPerPage = 20;

// Video initialization
function initializeVideo() {
    const video = document.querySelector('video');
    
    if (video) {
        // Force video playback
        video.play().catch(function(error) {
            console.log('Error playing video:', error);
        });
        
        // Ensure the video is muted (for autoplay)
        video.muted = true;
        
        // Prevent user from pausing the video with right-click
        video.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }
}

// Function to handle smooth scroll (if you add more sections)
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Get file icon and color based on extension
function getFileStyle(filename) {
    const ext = getFileExtension(filename);
    
    const styles = {
        // Documents
        'pdf': { gradient: 'from-red-50 to-pink-50', border: 'border-red-200', icon: 'text-red-600' },
        'doc': { gradient: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: 'text-blue-600' },
        'docx': { gradient: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: 'text-blue-600' },
        'odt': { gradient: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: 'text-blue-600' },
        
        // Spreadsheets
        'csv': { gradient: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'text-green-600' },
        'xlsx': { gradient: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
        'xls': { gradient: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
        'ods': { gradient: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
        
        // Data
        'json': { gradient: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', icon: 'text-amber-600' },
        'xml': { gradient: 'from-orange-50 to-amber-50', border: 'border-orange-200', icon: 'text-orange-600' },
        
        // Text
        'txt': { gradient: 'from-gray-50 to-slate-50', border: 'border-gray-200', icon: 'text-gray-600' },
        'md': { gradient: 'from-purple-50 to-indigo-50', border: 'border-purple-200', icon: 'text-purple-600' },
        
        // Default
        'default': { gradient: 'from-gray-50 to-slate-50', border: 'border-gray-200', icon: 'text-gray-600' }
    };
    
    return styles[ext] || styles['default'];
}

// Load files from API
async function loadFiles(page = 1) {
    try {
        const result = await getFiles(page, itemsPerPage);
        
        if (result.success && result.data.length > 0) {
            displayFiles(result.data);
            currentFilesPage = page;
        } else if (result.success && result.data.length === 0) {
            displayNoFiles();
        } else {
            console.error('Failed to load files:', result.error);
            displayFilesError(result.error);
        }
    } catch (error) {
        console.error('Error loading files:', error);
        displayFilesError(error.message);
    }
}

// Display files in the UI
function displayFiles(files) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg .space-y-3');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach(file => {
        const style = getFileStyle(file.absolute_path);
        const fileItem = document.createElement('a');
        fileItem.href = file.url || '#';
        fileItem.target = '_blank';
        fileItem.className = `block p-4 bg-gradient-to-r ${style.gradient} hover:${style.gradient.replace('50', '100')} rounded-lg transition duration-300 group ${style.border} file-item`;
        
        fileItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <svg class="w-7 h-7 ${style.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="text-gray-700 group-hover:text-gray-900 font-medium">${escapeHtml(file.absolute_path)}</span>
                </div>
                <span class="text-sm text-gray-600 font-semibold">${new Date(file.created_at).toLocaleDateString()}</span>
            </div>
        `;
        
        container.appendChild(fileItem);
    });
}

// Display "no files" message
function displayNoFiles() {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg .space-y-3');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p>No training files available yet</p>
        </div>
    `;
}

// Display files error
function displayFilesError(error) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg .space-y-3');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-red-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Failed to load files: ${escapeHtml(error)}</p>
        </div>
    `;
}

// Load results from API
async function loadResults(page = 1) {
    try {
        const result = await getResults(page, itemsPerPage);
        
        if (result.success && result.data.length > 0) {
            displayResults(result.data);
            currentResultsPage = page;
        } else if (result.success && result.data.length === 0) {
            displayNoResults();
        } else {
            console.error('Failed to load results:', result.error);
            displayResultsError(result.error);
        }
    } catch (error) {
        console.error('Error loading results:', error);
        displayResultsError(error.message);
    }
}

// Display results in the UI
function displayResults(results) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 hover:shadow-md transition duration-300 border border-blue-200 result-item';
        
        const timeAgo = getTimeAgo(new Date(result.created_at));
        
        resultItem.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-gray-800">Query</h3>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">${timeAgo}</span>
            </div>
            <div class="space-y-2">
                <div class="bg-white rounded-lg p-3 border border-blue-100">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-semibold text-gray-700">Question:</p>
                    </div>
                    <p class="text-sm text-gray-600 ml-6">${escapeHtml(result.question)}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-semibold text-gray-700">AI Response:</p>
                    </div>
                    <p class="text-sm text-green-700 ml-6 whitespace-pre-wrap">${escapeHtml(result.response)}</p>
                </div>
            </div>
        `;
        
        container.appendChild(resultItem);
    });
}

// Display "no results" message
function displayNoResults() {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <p>No AI research results available yet</p>
        </div>
    `;
}

// Display results error
function displayResultsError(error) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-8 text-red-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Failed to load results: ${escapeHtml(error)}</p>
        </div>
    `;
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Detect if user prefers reduced motion (accessibility)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeVideo();
    
    // Load data from API
    loadFiles(1);
    loadResults(1);
    
    // Pause video if user prefers reduced motion
    if (prefersReducedMotion.matches) {
        const video = document.querySelector('video');
        if (video) {
            video.pause();
        }
    }
});

// Welcome log in console
console.log('%c🌌 Exoplanets Retrieval-augmented generation', 'color: #4F46E5; font-size: 20px; font-weight: bold;');
console.log('%cExplore the universe of exoplanets', 'color: #818CF8; font-size: 14px;');
