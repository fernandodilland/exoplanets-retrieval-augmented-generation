// Dashboard Functionality (Dummy Implementation)

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== LOGOUT FUNCTIONALITY =====
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            // Simulate logout
            console.log('Logging out...');
            // Redirect to login page
            window.location.href = '../acceso/src/index.html';
        }
    });
    
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
    submitUpload.addEventListener('click', function() {
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
        
        // Simulate upload to R2
        console.log('Uploading files to R2:', selectedFiles);
        
        setTimeout(() => {
            this.disabled = false;
            this.innerHTML = originalText;
            showNotification(`Successfully uploaded ${selectedFiles.length} file(s) to R2 bucket!`, 'success');
            
            // Clear selection
            selectedFiles = [];
            fileList.innerHTML = '';
            filePreview.classList.add('hidden');
            fileInput.value = '';
        }, 2000);
    });
    
    // ===== EXOPLANET ANALYSIS FUNCTIONALITY =====
    const exoplanetQuery = document.getElementById('exoplanetQuery');
    const requestAnalysisBtn = document.getElementById('requestAnalysisBtn');
    const clearQueryBtn = document.getElementById('clearQueryBtn');
    const analysisResponse = document.getElementById('analysisResponse');
    const responseContent = document.getElementById('responseContent');
    
    requestAnalysisBtn.addEventListener('click', function() {
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
        
        // Simulate AI analysis
        console.log('Requesting analysis for:', query);
        
        setTimeout(() => {
            this.disabled = false;
            this.innerHTML = originalText;
            
            // Show dummy response
            analysisResponse.classList.remove('hidden');
            analysisResponse.classList.add('success-pulse');
            
            responseContent.innerHTML = `
                <p class="mb-3">
                    <strong>Query:</strong> ${query}
                </p>
                <p class="mb-3">
                    Based on the analysis of the exoplanet data stored in our RAG system, here are the findings:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li>Vector search performed across ${Math.floor(Math.random() * 1000) + 500} indexed documents</li>
                    <li>Retrieved ${Math.floor(Math.random() * 10) + 5} most relevant results with similarity scores > 0.4</li>
                    <li>Generated response using Llama 3.3 70B model</li>
                    <li>Processing time: ${(Math.random() * 2 + 1).toFixed(2)} seconds</li>
                </ul>
                <div class="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <p class="text-gray-700">
                        <em>This is a dummy response. In production, this would display the actual AI-generated analysis 
                        based on your query, using data from Cloudflare Vectorize and powered by the Llama 3.3 70B model.</em>
                    </p>
                </div>
            `;
            
            setTimeout(() => {
                analysisResponse.classList.remove('success-pulse');
            }, 500);
        }, 2000);
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
