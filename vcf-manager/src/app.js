/**
 * VCF Manager 11.1 - Application Entry Point
 * 
 * PURPOSE: Initialize application and create global instances
 * DEPENDENCIES: All other modules (loaded last)
 * EXPORTS: None (creates global variables)
 * 
 * This module:
 * 1. Creates global instances of core classes
 * 2. Initializes the application on DOM ready
 * 3. Makes instances accessible to inline HTML event handlers
 * 
 * AI MAINTENANCE NOTES:
 * - Global instances required for HTML onclick handlers (e.g., onclick="core.method()")
 * - This file must be loaded LAST (after all dependencies)
 * - To add new global instance: declare variable, instantiate in initApp()
 * - Initialization order matters: core → features
 */

/**
 * Global instance of ContactManager
 * Manages contact list, selection state, filtering, and UI rendering
 * @type {ContactManager}
 */
let core;

/**
 * Global instance of MergeTool
 * Handles contact merging and editing UI
 * @type {MergeTool}
 */
let mergeTool;

/**
 * Global instance of AutoMerger
 * Handles automatic duplicate detection and queue processing
 * @type {AutoMerger}
 */
let autoMerger;

/**
 * Initialize the application
 * 
 * INITIALIZATION SEQUENCE:
 * 1. Create core instance (ContactManager) - manages state
 * 2. Create feature instances (MergeTool, AutoMerger) - use core
 * 3. Initialize DOM bindings (event listeners)
 * 4. Log success message
 * 
 * CALLED BY: DOMContentLoaded event
 * 
 * AI MAINTENANCE NOTE:
 * To add new global instance:
 * 1. Declare variable above (let newInstance;)
 * 2. Instantiate here (newInstance = new NewClass();)
 * 3. Add to HTML script loading order
 * 4. Call init() if needed
 * 
 * @returns {void}
 */
function initApp() {
    // Create module instances in dependency order
    // Core first (no dependencies on other instances)
    core = new ContactManager();
    
    // Features second (may depend on core global)
    mergeTool = new MergeTool();
    autoMerger = new AutoMerger();

    // Initialize DOM bindings
    // Only core needs explicit init (sets up file input listener)
    core.init();

    // Log successful initialization
    console.log(`${Config.appName} ${Config.version} initialized successfully`);
}

/**
 * Application bootstrap
 * Wait for DOM to be fully loaded before initializing
 */
document.addEventListener('DOMContentLoaded', initApp);
