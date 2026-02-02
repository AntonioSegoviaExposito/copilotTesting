/**
 * VCF Manager - Phone Utilities Module
 * 
 * PURPOSE: Handle phone number normalization and formatting
 * DEPENDENCIES: Config (for default country code)
 * USED BY: ContactManager, VCFParser, MergeTool, AutoMerger
 * 
 * This module provides utilities for:
 * - Normalizing phone numbers to international format (+XX...)
 * - Formatting phone numbers for display
 * - Ensuring consistent phone number comparison
 * 
 * AI MAINTENANCE NOTES:
 * - Normalization ensures consistent format for duplicate detection
 * - All phone numbers stored in normalized format internally
 * - Format() is for display only, doesn't change stored value
 * - To support new country, update format() method with pattern
 */

/**
 * Phone utility functions
 * @namespace PhoneUtils
 */
const PhoneUtils = {
    /**
     * Normalize a phone number to international format
     * 
     * LOGIC:
     * 1. Remove all non-numeric characters except '+'
     * 2. Convert '00' prefix to '+' (international dialing code)
     * 3. Add default country code if no prefix present
     * 
     * EXAMPLES:
     * - '612345678' → '+34612345678' (adds default code)
     * - '0034612345678' → '+34612345678' (converts 00 to +)
     * - '+34 612 345 678' → '+34612345678' (removes spaces)
     * - '+44123456789' → '+44123456789' (preserves non-default code)
     * 
     * @param {string} phone - Raw phone number (may contain spaces, dashes, etc.)
     * @param {string} [defaultCode='+34'] - Default country code to add if missing
     * @returns {string} Normalized phone number in international format (+XXYYYYY...)
     * 
     * @example
     * PhoneUtils.normalize('612 345 678') // Returns: '+34612345678'
     * PhoneUtils.normalize('0034612345678') // Returns: '+34612345678'
     */
    normalize(phone, defaultCode = '+34') {
        if (!phone) return '';
        
        // Step 1: Remove all non-numeric characters except '+'
        let clean = phone.replace(/[^0-9+]/g, '');
        
        // Step 2: Convert '00XX' international prefix to '+XX' format
        if (clean.startsWith('00')) {
            clean = '+' + clean.slice(2);
        }
        
        // Step 3: Add default country code if missing and number is valid length
        // Only add if number doesn't already have a '+' prefix and meets minimum length
        if (!clean.startsWith('+') && clean.length >= Config.phone.minLength) {
            clean = defaultCode + clean;
        }
        
        return clean;
    },

    /**
     * Format a phone number for display
     * 
     * Currently supports formatting for +34 country code (Spain): +34 XXX XXX XXX
     * For other countries, returns normalized format without spacing
     * 
     * LOGIC:
     * 1. Normalize the phone number first
     * 2. Check if it matches +34 pattern (country code + 9 digits)
     * 3. If matches, format with spaces: +34 XXX XXX XXX
     * 4. Otherwise, return normalized format as-is
     * 
     * AI MAINTENANCE NOTE:
     * To add new country format:
     * 1. Add country code check (e.g., if (normalized.startsWith('+44')))
     * 2. Add length check for that country
     * 3. Add regex replace pattern for formatting
     * 
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number for display
     * 
     * @example
     * PhoneUtils.format('612345678') // Returns: '+34 612 345 678'
     * PhoneUtils.format('+44123456789') // Returns: '+44123456789' (no special format)
     */
    format(phone) {
        const normalized = this.normalize(phone);
        
        // Format numbers with +34 country code: +34 XXX XXX XXX (12 chars total)
        if (normalized.startsWith('+34') && normalized.length === 12) {
            return normalized.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        
        // For other countries, return normalized format
        return normalized;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneUtils;
}
