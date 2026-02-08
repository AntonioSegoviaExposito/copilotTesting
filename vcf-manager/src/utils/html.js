/**
 * VCF Manager - HTML Utility Functions
 * 
 * PURPOSE: Shared HTML escaping and validation utilities
 * DEPENDENCIES: None
 * USED BY: contacts.js, merge-tool.js, toast.js, duplicate-preview.js
 * 
 * Centralizes HTML security utilities to avoid duplication.
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML insertion
 */
export function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, char => {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[char];
    });
}

/**
 * Validate that a string is a safe hex color
 * @param {string} color - Color to validate
 * @returns {boolean} True if valid hex color (#RRGGBB format)
 */
export function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}
