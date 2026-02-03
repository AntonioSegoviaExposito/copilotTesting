/**
 * VCF Manager - Configuration Module
 * 
 * PURPOSE: Centralized application settings and constants
 * DEPENDENCIES: None (loaded first)
 * USED BY: All modules
 * 
 * This module provides a single source of truth for:
 * - Application metadata (version, name)
 * - Phone number handling configuration
 * - UI display settings
 * - User-facing messages
 * 
 * AI MAINTENANCE NOTES:
 * - Add new constants here instead of hardcoding values
 * - Phone settings support international formats (default +34)
 * - When adding new settings, follow the existing structure
 */

/**
 * @typedef {Object} PhoneConfig
 * @property {string} defaultCountryCode - Default country code for phone numbers (e.g., '+34' for Spain, '+1' for US)
 * @property {number} minLength - Minimum phone number length (digits only)
 */

/**
 * @typedef {Object} UIConfig
 * @property {number} maxTelsDisplay - Maximum phone numbers to display per contact card
 * @property {string} defaultFileName - Default filename for exported VCF files (timestamp will be appended)
 */

/**
 * @typedef {Object} Messages
 * @property {string} emptyList - Message when trying to export empty list
 * @property {string} noData - Message when no contacts match filter
 * @property {string} noName - Placeholder for contacts without name
 * @property {function(number): string} confirmDelete - Confirmation message for deletion
 * @property {string} confirmClear - Confirmation message for clearing all contacts
 * @property {string} emptyAgenda - Message when starting auto-merge with no contacts
 * @property {string} noDuplicates - Message when no duplicates found
 * @property {string} autoMergeComplete - Message when auto-merge finishes
 * @property {string} autoMergeCancelled - Message when auto-merge is cancelled
 * @property {string} sortAlpha - Message when sorting alphabetically
 * @property {string} sortCreation - Message when sorting by creation order
 */

/**
 * @typedef {Object} Config
 * @property {string} version - Application version number
 * @property {string} appName - Application display name
 * @property {PhoneConfig} phone - Phone number configuration
 * @property {UIConfig} ui - User interface settings
 * @property {Messages} messages - User-facing messages
 */

/**
 * Global configuration object
 * @type {Config}
 */
const Config = {
    // App metadata
    version: '11.1',
    appName: 'VCF Manager',

    // vCard version settings
    vcard: {
        defaultVersion: '4.0',      // Default vCard version for export (4.0 for modern features)
        supportedVersions: ['2.1', '3.0', '4.0']  // Supported vCard versions
    },

    // Phone number settings (configurable for different countries)
    phone: {
        defaultCountryCode: '+34',  // Spain country code (can be configured)
        minLength: 9                 // Minimum digits for valid phone number
    },

    // UI display settings
    ui: {
        maxTelsDisplay: 3,          // Show up to 3 phone numbers per card (others collapsed)
        defaultFileName: 'contacts' // Base filename for exports (timestamp added automatically)
    },

    // User-facing messages
    messages: {
        emptyList: 'Empty list',
        noData: 'No data',
        noName: 'No Name',
        confirmDelete: (count) => `Delete ${count} contact${count !== 1 ? 's' : ''}?`,
        confirmClear: 'Clear everything?',
        emptyAgenda: 'Empty contact list.',
        noDuplicates: 'No duplicates found.',
        autoMergeComplete: 'Automatic merge completed!',
        autoMergeCancelled: 'Auto-merge cancelled.',
        sortAlpha: 'List sorted alphabetically',
        sortCreation: 'List sorted by creation order',
        vcardVersionUpgrade: 'This file was imported in an older vCard format (v3.0). Would you like to export it in the modern vCard 4.0 format for better compatibility with current devices, or keep the legacy v3.0 format?',
        vcardVersion40: 'Modern format (vCard 4.0) - Recommended for iOS 14+, Android 10+, modern email clients',
        vcardVersion30: 'Legacy format (vCard 3.0) - For older devices and email clients'
    }
};

// Export for module usage (ESM)
export default Config;
