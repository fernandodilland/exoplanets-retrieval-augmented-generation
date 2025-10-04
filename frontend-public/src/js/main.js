// JavaScript for additional site functionalities

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

// Pagination functionality
function initializePagination() {
    // This is a placeholder for pagination logic
    // In a real application, this would handle API calls and data loading
    console.log('Pagination initialized');
}

// Detect if user prefers reduced motion (accessibility)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeVideo();
    initializePagination();
    
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
