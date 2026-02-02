/**
 * VCF Manager 11.1 - Application Entry Point
 * Initializes all modules and global instances
 */

// Global instances (accessible from HTML onclick handlers)
let core;
let mergeTool;
let autoMerger;

/**
 * Initialize the application
 */
function initApp() {
    // Create module instances
    core = new ContactManager();
    mergeTool = new MergeTool();
    autoMerger = new AutoMerger();

    // Initialize DOM bindings
    core.init();

    console.log(`${Config.appName} ${Config.version} initialized successfully`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
