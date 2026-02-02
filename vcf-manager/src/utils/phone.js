/**
 * VCF Manager - Phone Utilities
 * Handles phone number normalization and formatting
 */

const PhoneUtils = {
    /**
     * Normalize a phone number to international format
     * @param {string} phone - Raw phone number
     * @param {string} defaultCode - Default country code (e.g., '+34')
     * @returns {string} Normalized phone number
     */
    normalize(phone, defaultCode = '+34') {
        if (!phone) return '';
        
        let clean = phone.replace(/[^0-9+]/g, '');
        
        // Convert 00XX to +XX format
        if (clean.startsWith('00')) {
            clean = '+' + clean.slice(2);
        }
        
        // Add default country code if missing
        if (!clean.startsWith('+') && clean.length >= Config.phone.minLength) {
            clean = defaultCode + clean;
        }
        
        return clean;
    },

    /**
     * Format a phone number for display
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number
     */
    format(phone) {
        const normalized = this.normalize(phone);
        
        // Format Spanish numbers: +34 XXX XXX XXX
        if (normalized.startsWith('+34') && normalized.length === 12) {
            return normalized.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        
        return normalized;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneUtils;
}
