// Dashboard Functionality

// ===== GLOBAL LOGOUT FUNCTION =====
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        // Remove authentication token
        removeToken();
        console.log('Logged out successfully');
        // Redirect to login page
        window.location.href = 'acceso/index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== AUTHENTICATION CHECK =====
    // Check if user is authenticated
    if (!isAuthenticated()) {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = 'acceso/index.html';
        return;
    }
    
    // Display user info
    const userInfo = getUserInfo();
    console.log('Logged in as:', userInfo.username);
    
    // ===== FILE UPLOAD FUNCTIONALITY =====
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    const submitUpload = document.getElementById('submitUpload');
    const maxFileSize = 4 * 1024 * 1024; // 4 MB in bytes
    
    let selectedFiles = [];
    
    // Click to select files
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Drag and drop functionality
    const uploadArea = uploadBtn.closest('.border-dashed');
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // Handle files function
    function handleFiles(files) {
        selectedFiles = [];
        fileList.innerHTML = '';
        
        files.forEach(file => {
            // Validate file size
            if (file.size > maxFileSize) {
                showNotification(`File "${file.name}" exceeds 4 MB limit`, 'error');
                return;
            }
            
            selectedFiles.push(file);
            
            // Create file item
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 file-item-appear';
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <div>
                        <p class="font-medium text-gray-800">${file.name}</p>
                        <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="text-red-600 hover:text-red-800 remove-file" data-filename="${file.name}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            
            fileList.appendChild(fileItem);
        });
        
        if (selectedFiles.length > 0) {
            filePreview.classList.remove('hidden');
        } else {
            filePreview.classList.add('hidden');
        }
        
        // Add remove functionality
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', function() {
                const filename = this.getAttribute('data-filename');
                selectedFiles = selectedFiles.filter(f => f.name !== filename);
                this.closest('.file-item-appear').remove();
                
                if (selectedFiles.length === 0) {
                    filePreview.classList.add('hidden');
                }
            });
        });
    }
    
    // Submit upload
    submitUpload.addEventListener('click', async function() {
        if (selectedFiles.length === 0) {
            showNotification('No files selected', 'error');
            return;
        }
        
        // Show loading state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
        `;
        
        // Upload files one by one
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name);
            
            try {
                const result = await uploadFile(file, (progress) => {
                    console.log(`Upload progress for ${file.name}: ${progress.toFixed(1)}%`);
                });
                
                if (result.success) {
                    successCount++;
                    console.log(`File uploaded successfully: ${file.name}`, result.data);
                } else {
                    errorCount++;
                    console.error(`Failed to upload ${file.name}:`, result.error);
                    showNotification(`Failed to upload ${file.name}: ${result.error}`, 'error');
                }
            } catch (error) {
                errorCount++;
                console.error(`Error uploading ${file.name}:`, error);
                showNotification(`Error uploading ${file.name}`, 'error');
            }
        }
        
        // Restore button state
        this.disabled = false;
        this.innerHTML = originalText;
        
        // Show summary notification
        if (successCount > 0 && errorCount === 0) {
            showNotification(`Successfully uploaded ${successCount} file(s) to R2 bucket!`, 'success');
        } else if (successCount > 0 && errorCount > 0) {
            showNotification(`Uploaded ${successCount} file(s), ${errorCount} failed`, 'info');
        } else {
            showNotification(`Failed to upload files`, 'error');
        }
        
        // Clear selection if all successful
        if (errorCount === 0) {
            selectedFiles = [];
            fileList.innerHTML = '';
            filePreview.classList.add('hidden');
            fileInput.value = '';
        }
    });
    
    // ===== EXOPLANET ANALYSIS FUNCTIONALITY =====
    const exoplanetQuery = document.getElementById('exoplanetQuery');
    const requestAnalysisBtn = document.getElementById('requestAnalysisBtn');
    const clearQueryBtn = document.getElementById('clearQueryBtn');
    const analysisResponse = document.getElementById('analysisResponse');
    const responseContent = document.getElementById('responseContent');
    
    requestAnalysisBtn.addEventListener('click', async function() {
        const query = exoplanetQuery.value.trim();
        
        if (!query) {
            showNotification('Please enter a query', 'error');
            return;
        }
        
        // Show loading state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = `
            <svg class="animate-spin h-6 w-6 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
        `;
        
        try {
            console.log('Requesting AI analysis for:', query);
            const startTime = Date.now();
            
            // Send AI request
            const result = await sendAIRequest(query);
            
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
            
            // Restore button state
            this.disabled = false;
            this.innerHTML = originalText;
            
            if (result.success) {
                // Show response
                analysisResponse.classList.remove('hidden');
                analysisResponse.classList.add('success-pulse');
                
                const aiResponse = result.data;
                
                responseContent.innerHTML = `
                    <div class="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p class="font-semibold text-purple-900 mb-2">📊 Query:</p>
                        <p class="text-gray-700">${escapeHtml(aiResponse.question)}</p>
                    </div>
                    <div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p class="font-semibold text-blue-900 mb-2">🤖 AI Response:</p>
                        <div class="text-gray-700 whitespace-pre-wrap">${escapeHtml(aiResponse.response)}</div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>⏱️ Processing time: ${processingTime} seconds</p>
                        <p>📅 Generated at: ${new Date(aiResponse.created_at).toLocaleString()}</p>
                    </div>
                `;
                
                setTimeout(() => {
                    analysisResponse.classList.remove('success-pulse');
                }, 500);
                
                showNotification('AI analysis completed successfully', 'success');
            } else {
                // Show error
                showNotification(result.error || 'Failed to get AI response', 'error');
                
                analysisResponse.classList.remove('hidden');
                responseContent.innerHTML = `
                    <div class="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p class="font-semibold text-red-900 mb-2">❌ Error:</p>
                        <p class="text-red-700">${escapeHtml(result.error || 'Unknown error occurred')}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('AI request error:', error);
            
            // Restore button state
            this.disabled = false;
            this.innerHTML = originalText;
            
            showNotification('An unexpected error occurred', 'error');
            
            analysisResponse.classList.remove('hidden');
            responseContent.innerHTML = `
                <div class="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p class="font-semibold text-red-900 mb-2">❌ Error:</p>
                    <p class="text-red-700">${escapeHtml(error.message || 'Unknown error')}</p>
                </div>
            `;
        }
    });
    
    clearQueryBtn.addEventListener('click', function() {
        exoplanetQuery.value = '';
        analysisResponse.classList.add('hidden');
        responseContent.innerHTML = '';
    });
    
    // ===== UTILITY FUNCTIONS =====
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${type === 'success' ? 
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                        type === 'error' ?
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                    }
                </svg>
                <p class="font-semibold">${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
});
