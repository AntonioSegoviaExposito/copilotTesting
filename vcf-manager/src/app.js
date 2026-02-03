/**
 * VCF Manager 11.1 - Application Entry Point
 * 
 * PURPOSE: Initialize application and create global instances
 * DEPENDENCIES: All other modules (loaded via ES module imports)
 * EXPORTS: None (exposes instances to window for HTML onclick handlers)
 * 
 * This module:
 * 1. Imports all dependencies as ES modules
 * 2. Creates global instances of core classes
 * 3. Exposes instances to window for inline HTML event handlers
 * 4. Initializes the application on DOM ready
 * 
 * AI MAINTENANCE NOTES:
 * - Window globals required for HTML onclick handlers (e.g., onclick="core.method()")
 * - This file must be loaded as type="module" in HTML
 * - To add new global instance: import module, instantiate in initApp(), expose to window
 * - Initialization order matters: core -> features
 */

// Import all modules (ES Module syntax)
import Config from './config.js';
import PhoneUtils from './utils/phone.js';
import Toast from './utils/toast.js';
import VCFParser from './core/vcf-parser.js';
import ContactManager from './core/contacts.js';
import MergeTool from './features/merge-tool.js';
import AutoMerger from './features/auto-merger.js';

// Expose utilities to window for modules that depend on globals
window.Config = Config;
window.PhoneUtils = PhoneUtils;
window.Toast = Toast;
window.VCFParser = VCFParser;

/**
 * Initialize the application
 * 
 * INITIALIZATION SEQUENCE:
 * 1. Create core instance (ContactManager) - manages state
 * 2. Create feature instances (MergeTool, AutoMerger) - use core
 * 3. Expose instances to window (for HTML onclick handlers)
 * 4. Initialize DOM bindings (event listeners)
 * 5. Log success message
 * 
 * CALLED BY: DOMContentLoaded event
 * 
 * AI MAINTENANCE NOTE:
 * To add new global instance:
 * 1. Import the module above
 * 2. Instantiate here
 * 3. Expose to window (window.newInstance = newInstance)
 * 4. Call init() if needed
 * 
 * @returns {void}
 */
function initApp() {
    // Create module instances in dependency order
    // Core first (no dependencies on other instances)
    const core = new ContactManager();
    
    // Features second (may depend on core global)
    const mergeTool = new MergeTool();
    const autoMerger = new AutoMerger();

    // Expose instances to window for HTML onclick handlers
    // Required because ES modules have their own scope
    window.core = core;
    window.mergeTool = mergeTool;
    window.autoMerger = autoMerger;

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
