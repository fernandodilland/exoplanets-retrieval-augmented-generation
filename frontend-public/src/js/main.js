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

// Show loading animation for files
function showFilesLoading() {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg .space-y-3');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p class="text-center text-gray-500">Loading training files...</p>
    `;
}

// Load files from API
async function loadFiles(page = 1) {
    try {
        showFilesLoading();
        
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

// Show loading animation for results
function showResultsLoading() {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <p class="text-center text-gray-500">Loading research results...</p>
    `;
}

// Load results from API
async function loadResults(page = 1) {
    try {
        showResultsLoading();
        
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

// Parse analysis parameters from question text
function parseAnalysisParameters(questionText) {
    const params = {};
    
    try {
        // Try to extract JSON configuration
        const configMatch = questionText.match(/Configuration:\s*({[^}]+})/i);
        if (configMatch) {
            const config = JSON.parse(configMatch[1]);
            params.max_results = config.max_results;
            params.score_threshold = config.score_threshold;
        }
        
        // Try to extract analysis parameters
        const paramsMatch = questionText.match(/Analysis Parameters:\s*({[\s\S]+?})\s*(?:Configuration:|$)/i);
        if (paramsMatch) {
            const analysisParams = JSON.parse(paramsMatch[1]);
            Object.assign(params, analysisParams);
        }
        
        // Extract user description (before Analysis Parameters)
        const descMatch = questionText.match(/^([\s\S]+?)(?:\n\nAnalysis Parameters:|Configuration:|Please analyze)/i);
        if (descMatch) {
            params.description = descMatch[1].trim();
        }
    } catch (e) {
        // If parsing fails, treat as simple query
        params.simple_query = questionText;
    }
    
    return params;
}

// Display results in the UI
function displayResults(results) {
    const container = document.querySelector('.bg-white.rounded-xl.shadow-lg:last-child .space-y-4');
    if (!container) return;
    
    container.innerHTML = '';
    
    results.forEach((result, index) => {
        const probability = result.probability_percentage;
        const hasProbability = probability !== null && probability !== undefined;
        
        // Parse parameters from question
        const params = parseAnalysisParameters(result.question);
        const isScientificAnalysis = !params.simple_query;
        
        // Determine styling based on probability - using inline styles
        let barColor = '#6B7280';
        let bgColor = '#F9FAFB';
        let borderColor = '#E5E7EB';
        let textColor = '#111827';
        let statusText = 'Research Result';
        let statusIcon = '�';
        
        if (hasProbability) {
            if (probability >= 80) {
                barColor = '#10B981';
                bgColor = '#ECFDF5';
                borderColor = '#A7F3D0';
                textColor = '#065F46';
                statusText = 'Highly Likely Exoplanet';
                statusIcon = '✅';
            } else if (probability >= 60) {
                barColor = '#3B82F6';
                bgColor = '#EFF6FF';
                borderColor = '#BFDBFE';
                textColor = '#1E3A8A';
                statusText = 'Likely Exoplanet';
                statusIcon = '✓';
            } else if (probability >= 40) {
                barColor = '#F59E0B';
                bgColor = '#FFFBEB';
                borderColor = '#FDE68A';
                textColor = '#78350F';
                statusText = 'Uncertain';
                statusIcon = '⚠️';
            } else if (probability >= 20) {
                barColor = '#F97316';
                bgColor = '#FFF7ED';
                borderColor = '#FED7AA';
                textColor = '#7C2D12';
                statusText = 'Unlikely Exoplanet';
                statusIcon = '⚠';
            } else {
                barColor = '#EF4444';
                bgColor = '#FEF2F2';
                borderColor = '#FECACA';
                textColor = '#7F1D1D';
                statusText = 'Not an Exoplanet';
                statusIcon = '❌';
            }
        }
        
        const resultItem = document.createElement('div');
        resultItem.className = 'rounded-lg p-4 hover:shadow-lg transition duration-300 border result-item';
        resultItem.style.backgroundColor = bgColor;
        resultItem.style.borderColor = borderColor;
        
        const timeAgo = getTimeAgo(new Date(result.created_at));
        const uniqueId = `result-${result.uid}`;
        
        // Build HTML content
        let contentHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" style="color: ${textColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <h3 class="text-lg font-bold" style="color: ${textColor};">Exoplanet Research</h3>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">${timeAgo}</span>
            </div>
        `;
        
        // Research parameters (if scientific analysis)
        if (isScientificAnalysis && Object.keys(params).length > 0) {
            contentHTML += '<div class="mb-3 p-3 bg-white rounded-lg border border-gray-200">';
            contentHTML += '<p class="text-xs font-semibold text-gray-700 mb-2">🔬 Research Parameters</p>';
            contentHTML += '<div class="grid grid-cols-2 gap-2 text-xs">';
            
            if (params.radius_earth) contentHTML += `<div><span class="text-gray-600">Radius:</span> <span class="font-semibold text-gray-800">${params.radius_earth} R⊕</span></div>`;
            if (params.mass_earth) contentHTML += `<div><span class="text-gray-600">Mass:</span> <span class="font-semibold text-gray-800">${params.mass_earth} M⊕</span></div>`;
            if (params.orbital_period_days) contentHTML += `<div><span class="text-gray-600">Orbital Period:</span> <span class="font-semibold text-gray-800">${params.orbital_period_days} days</span></div>`;
            if (params.distance_light_years) contentHTML += `<div><span class="text-gray-600">Distance:</span> <span class="font-semibold text-gray-800">${params.distance_light_years} ly</span></div>`;
            if (params.star_type) contentHTML += `<div><span class="text-gray-600">Star Type:</span> <span class="font-semibold text-gray-800">${params.star_type}</span></div>`;
            if (params.in_habitable_zone !== undefined) contentHTML += `<div><span class="text-gray-600">Habitable Zone:</span> <span class="font-semibold text-gray-800">${params.in_habitable_zone ? 'Yes' : 'No'}</span></div>`;
            if (params.max_results) contentHTML += `<div><span class="text-gray-600">Max Results:</span> <span class="font-semibold text-gray-800">${params.max_results}</span></div>`;
            if (params.score_threshold) contentHTML += `<div><span class="text-gray-600">Score Threshold:</span> <span class="font-semibold text-gray-800">${params.score_threshold}</span></div>`;
            
            contentHTML += '</div>';
            if (params.description) {
                contentHTML += `<p class="text-xs text-gray-600 mt-2 italic">"${escapeHtml(params.description)}"</p>`;
            }
            contentHTML += '</div>';
        }
        
        // Probability section (clickable)
        if (hasProbability) {
            contentHTML += `
                <div class="mb-3 p-4 bg-white rounded-lg border-2 cursor-pointer hover:shadow-md transition-all" 
                     style="border-color: ${borderColor};"
                     onclick="document.getElementById('${uniqueId}-details').classList.toggle('hidden')">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold text-gray-600 mb-1">Research Result Using AI</p>
                            <p class="text-sm font-bold" style="color: ${textColor};">${statusIcon} ${statusText}</p>
                        </div>
                        <div class="text-center">
                            <div class="text-4xl font-bold" style="color: ${textColor};">${probability}%</div>
                            <p class="text-xs text-gray-500 mt-1">Click for details</p>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                        <div class="h-2 rounded-full transition-all duration-500"
                             style="width: ${probability}%; background-color: ${barColor};">
                        </div>
                    </div>
                </div>
            `;
            
            // Hidden detailed response
            contentHTML += `
                <div id="${uniqueId}-details" class="hidden mb-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-semibold text-blue-900">Detailed Analysis</p>
                    </div>
                    <p class="text-sm text-blue-800 whitespace-pre-wrap">${escapeHtml(result.response)}</p>
                </div>
            `;
        } else {
            // No probability - show simple format
            contentHTML += `
                <div class="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p class="text-xs font-semibold text-gray-700 mb-2">📝 Query</p>
                    <p class="text-sm text-gray-600">${escapeHtml(params.simple_query || result.question)}</p>
                </div>
                <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p class="text-xs font-semibold text-blue-900 mb-2">🤖 AI Response</p>
                    <p class="text-sm text-blue-800 whitespace-pre-wrap">${escapeHtml(result.response)}</p>
                </div>
            `;
        }
        
        resultItem.innerHTML = contentHTML;
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
