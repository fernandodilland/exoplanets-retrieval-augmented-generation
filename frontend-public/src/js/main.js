// JavaScript for additional site functionalities

// State management
let currentFilesPage = 1;
let currentResultsPage = 1;
let totalFilesCount = 0;
let totalResultsCount = 0;
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
        // Get total count and files in parallel
        const [countResult, filesResult] = await Promise.all([
            getFilesCount(),
            getFiles(page, itemsPerPage)
        ]);
        
        if (countResult.success) {
            totalFilesCount = countResult.data.count;
        }
        
        if (filesResult.success && filesResult.data.length > 0) {
            displayFiles(filesResult.data);
            currentFilesPage = page;
            updateFilesPagination();
        } else if (filesResult.success && filesResult.data.length === 0) {
            displayNoFiles();
            hideFilesPagination();
        } else {
            console.error('Failed to load files:', filesResult.error);
            displayFilesError(filesResult.error);
            hideFilesPagination();
        }
    } catch (error) {
        console.error('Error loading files:', error);
        displayFilesError(error.message);
        hideFilesPagination();
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
        // Get total count and results in parallel
        const [countResult, resultsResult] = await Promise.all([
            getResultsCount(),
            getResults(page, itemsPerPage)
        ]);
        
        if (countResult.success) {
            totalResultsCount = countResult.data.count;
        }
        
        if (resultsResult.success && resultsResult.data.length > 0) {
            displayResults(resultsResult.data);
            currentResultsPage = page;
            updateResultsPagination();
        } else if (resultsResult.success && resultsResult.data.length === 0) {
            displayNoResults();
            hideResultsPagination();
        } else {
            console.error('Failed to load results:', resultsResult.error);
            displayResultsError(resultsResult.error);
            hideResultsPagination();
        }
    } catch (error) {
        console.error('Error loading results:', error);
        displayResultsError(error.message);
        hideResultsPagination();
    }
}

// Display results in the UI
function displayResults(results) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = '';
    
    results.forEach((result, index) => {
        const probability = result.probability_percentage;
        const hasProbability = probability !== null && probability !== undefined;
        
        // Determine styling based on probability
        let bgGradient = 'from-blue-50 to-indigo-50';
        let borderColor = 'border-blue-200';
        let statusColor = 'blue';
        let statusText = 'Analysis Result';
        let statusIcon = '📊';
        
        if (hasProbability) {
            if (probability >= 80) {
                bgGradient = 'from-green-50 to-emerald-50';
                borderColor = 'border-green-300';
                statusColor = 'green';
                statusText = 'Highly Likely Exoplanet';
                statusIcon = '✅';
            } else if (probability >= 60) {
                bgGradient = 'from-blue-50 to-cyan-50';
                borderColor = 'border-blue-300';
                statusColor = 'blue';
                statusText = 'Likely Exoplanet';
                statusIcon = '✓';
            } else if (probability >= 40) {
                bgGradient = 'from-yellow-50 to-amber-50';
                borderColor = 'border-yellow-300';
                statusColor = 'yellow';
                statusText = 'Uncertain';
                statusIcon = '⚠️';
            } else if (probability >= 20) {
                bgGradient = 'from-orange-50 to-red-50';
                borderColor = 'border-orange-300';
                statusColor = 'orange';
                statusText = 'Unlikely Exoplanet';
                statusIcon = '⚠';
            } else {
                bgGradient = 'from-red-50 to-pink-50';
                borderColor = 'border-red-300';
                statusColor = 'red';
                statusText = 'Not an Exoplanet';
                statusIcon = '❌';
            }
        }
        
        const resultItem = document.createElement('div');
        resultItem.className = `bg-gradient-to-br ${bgGradient} rounded-lg p-4 hover:shadow-md transition duration-300 border ${borderColor} result-item`;
        
        const timeAgo = getTimeAgo(new Date(result.created_at));
        
        let probabilityHTML = '';
        if (hasProbability) {
            probabilityHTML = `
                <div class="mb-3 p-3 bg-white rounded-lg border border-${statusColor}-200">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-bold text-${statusColor}-900">${statusIcon} ${statusText}</span>
                        <span class="text-2xl font-bold text-${statusColor}-700">${probability}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-${statusColor}-600 h-3 rounded-full transition-all duration-500"
                             style="width: ${probability}%">
                        </div>
                    </div>
                </div>
            `;
        }
        
        resultItem.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-${statusColor}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-gray-800">${hasProbability ? 'Exoplanet Analysis' : 'Query'}</h3>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">${timeAgo}</span>
            </div>
            ${probabilityHTML}
            <div class="space-y-2">
                <div class="bg-white rounded-lg p-3 border border-${statusColor}-100">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 text-${statusColor}-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-semibold text-gray-700">Question:</p>
                    </div>
                    <p class="text-sm text-gray-600 ml-6">${escapeHtml(result.question)}</p>
                </div>
                <div class="bg-${statusColor === 'blue' ? 'green' : statusColor}-50 rounded-lg p-3 border border-${statusColor === 'blue' ? 'green' : statusColor}-200">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 text-${statusColor === 'blue' ? 'green' : statusColor}-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-semibold text-gray-700">AI Response:</p>
                    </div>
                    <p class="text-sm text-${statusColor === 'blue' ? 'green' : statusColor}-700 ml-6 whitespace-pre-wrap">${escapeHtml(result.response)}</p>
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

// Pagination functions for Files
function updateFilesPagination() {
    const totalPages = Math.ceil(totalFilesCount / itemsPerPage);
    
    // Hide pagination if only one page or no items
    if (totalPages <= 1) {
        hideFilesPagination();
        return;
    }
    
    const paginationContainer = document.getElementById('filesPagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = createPaginationHTML(currentFilesPage, totalPages, 'files', 'blue');
    paginationContainer.classList.remove('hidden');
    paginationContainer.classList.add('flex');
    
    // Add event listeners
    attachPaginationListeners('files');
}

function hideFilesPagination() {
    const paginationContainer = document.getElementById('filesPagination');
    if (paginationContainer) {
        paginationContainer.classList.add('hidden');
        paginationContainer.classList.remove('flex');
    }
}

// Pagination functions for Results
function updateResultsPagination() {
    const totalPages = Math.ceil(totalResultsCount / itemsPerPage);
    
    // Hide pagination if only one page or no items
    if (totalPages <= 1) {
        hideResultsPagination();
        return;
    }
    
    const paginationContainer = document.getElementById('resultsPagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = createPaginationHTML(currentResultsPage, totalPages, 'results', 'purple');
    paginationContainer.classList.remove('hidden');
    paginationContainer.classList.add('flex');
    
    // Add event listeners
    attachPaginationListeners('results');
}

function hideResultsPagination() {
    const paginationContainer = document.getElementById('resultsPagination');
    if (paginationContainer) {
        paginationContainer.classList.add('hidden');
        paginationContainer.classList.remove('flex');
    }
}

// Create pagination HTML
function createPaginationHTML(currentPage, totalPages, type, color) {
    const prevDisabled = currentPage === 1;
    const nextDisabled = currentPage === totalPages;
    
    // Calculate which page numbers to show
    const pagesToShow = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
            pagesToShow.push(i);
        }
    } else {
        // Show first, last, current, and neighbors
        pagesToShow.push(1);
        
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        
        if (startPage > 2) {
            pagesToShow.push('...');
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pagesToShow.push(i);
        }
        
        if (endPage < totalPages - 1) {
            pagesToShow.push('...');
        }
        
        pagesToShow.push(totalPages);
    }
    
    let html = `
        <button class="px-4 py-2 bg-gray-200 text-gray-${prevDisabled ? '400' : '700'} rounded-lg hover:bg-gray-300 transition duration-300 ${prevDisabled ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}" 
                data-page="${currentPage - 1}" 
                data-type="${type}" 
                data-action="prev" 
                ${prevDisabled ? 'disabled' : ''}>
            <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
        </button>
        <div class="flex space-x-2">
    `;
    
    pagesToShow.forEach(page => {
        if (page === '...') {
            html += `<span class="px-4 py-2 text-gray-500">...</span>`;
        } else {
            const isActive = page === currentPage;
            html += `
                <button class="px-4 py-2 ${isActive ? `bg-${color}-600 text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg ${isActive ? 'shadow-md' : ''} transition duration-300" 
                        data-page="${page}" 
                        data-type="${type}" 
                        data-action="page"
                        ${isActive ? 'disabled' : ''}>
                    ${page}
                </button>
            `;
        }
    });
    
    html += `
        </div>
        <button class="px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition duration-300 ${nextDisabled ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}" 
                data-page="${currentPage + 1}" 
                data-type="${type}" 
                data-action="next"
                ${nextDisabled ? 'disabled' : ''}>
            Next
            <svg class="w-5 h-5 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
    `;
    
    return html;
}

// Attach pagination event listeners
function attachPaginationListeners(type) {
    const paginationContainer = document.getElementById(`${type}Pagination`);
    if (!paginationContainer) return;
    
    paginationContainer.querySelectorAll('button[data-type]').forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            const buttonType = this.getAttribute('data-type');
            
            if (buttonType === 'files') {
                loadFiles(page);
            } else if (buttonType === 'results') {
                loadResults(page);
            }
            
            // Scroll to top of section
            const section = paginationContainer.closest('.bg-white');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Welcome log in console
console.log('%c🌌 Exoplanets Retrieval-augmented generation', 'color: #4F46E5; font-size: 20px; font-weight: bold;');
console.log('%cExplore the universe of exoplanets', 'color: #818CF8; font-size: 14px;');
