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
 * - User-facing messages (Spanish)
 * 
 * AI MAINTENANCE NOTES:
 * - Add new constants here instead of hardcoding values
 * - UI messages are in Spanish for the target audience
 * - Phone settings default to Spanish format (+34)
 * - When adding new settings, follow the existing structure
 */

/**
 * @typedef {Object} PhoneConfig
 * @property {string} defaultCountryCode - Default country code for phone numbers (e.g., '+34' for Spain)
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
 * @property {Messages} messages - User-facing messages (Spanish)
 */

/**
 * Global configuration object
 * @type {Config}
 */
const Config = {
    // App metadata
    version: '11.1',
    appName: 'VCF Manager',

    // Phone number settings (Spanish format by default)
    phone: {
        defaultCountryCode: '+34',  // Spain country code
        minLength: 9                 // Minimum digits for valid phone number
    },

    // UI display settings
    ui: {
        maxTelsDisplay: 3,          // Show up to 3 phone numbers per card (others collapsed)
        defaultFileName: 'contactos' // Base filename for exports (timestamp added automatically)
    },

    // User-facing messages (Spanish for target audience)
    messages: {
        emptyList: 'Lista vacia',
        noData: 'No hay datos',
        noName: 'Sin Nombre',
        confirmDelete: (count) => `¿Eliminar ${count} contactos?`,
        confirmClear: '¿Borrar todo?',
        emptyAgenda: 'Agenda vacia.',
        noDuplicates: 'No se encontraron duplicados.',
        autoMergeComplete: '¡Proceso automatico finalizado!',
        autoMergeCancelled: 'Auto-Fusion cancelada.',
        sortAlpha: 'Lista ordenada Alfabeticamente',
        sortCreation: 'Lista ordenada por Creacion'
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
