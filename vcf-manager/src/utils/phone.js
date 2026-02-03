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

import Config from '../config.js';

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
     * 3. Add default country code if no prefix present and meets minimum length
     * 4. Non-restrictive: If can't normalize, keep cleaned version
     * 
     * SUPPORTED COUNTRY CODES:
     * - +34 (Spain): 9 digits
     * - +1 (USA/Canada): 10 digits
     * - +44 (UK): 10 digits (mobile/landline)
     * - +33 (France): 9 digits
     * - +49 (Germany): Variable length (10-11 digits typical)
     * 
     * EXAMPLES:
     * - '612345678' → '+34612345678' (adds default code)
     * - '0034612345678' → '+34612345678' (converts 00 to +)
     * - '+34 612 345 678' → '+34612345678' (removes spaces)
     * - '+44 7911 123456' → '+447911123456' (preserves UK mobile)
     * - '+1 415 555 1234' → '+14155551234' (preserves USA)
     * - 'invalid' → 'invalid' (non-restrictive)
     * 
     * @param {string} phone - Raw phone number (may contain spaces, dashes, etc.)
     * @param {string} [defaultCode='+34'] - Default country code to add if missing
     * @returns {string} Normalized phone number in international format (+XXYYYYY...)
     * 
     * @example
     * PhoneUtils.normalize('612 345 678') // Returns: '+34612345678'
     * PhoneUtils.normalize('0034612345678') // Returns: '+34612345678'
     * PhoneUtils.normalize('+1 415 555 1234') // Returns: '+14155551234'
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
        
        // Step 4: If still no '+' prefix and too short, keep as-is (non-restrictive)
        // This allows free-form text like extensions, special numbers, etc.
        
        return clean;
    },

    /**
     * Format a phone number for display
     * 
     * Supports formatting for multiple country codes:
     * - +34 (Spain): +34 XXX XXX XXX
     * - +1 (USA/Canada): +1 XXX XXX XXXX
     * - +44 (UK): +44 XXXX XXXXXX (mobile: +44 7XXX XXXXXX)
     * - +33 (France): +33 X XX XX XX XX
     * - +49 (Germany): +49 XXX XXXXXXXX (variable length)
     * 
     * For other countries or non-standard formats, returns normalized format
     * 
     * LOGIC:
     * 1. Normalize the phone number first
     * 2. Check country code and apply appropriate format
     * 3. If no format matches, return normalized format as-is
     * 
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number for display
     * 
     * @example
     * PhoneUtils.format('612345678') // Returns: '+34 612 345 678' (Spain)
     * PhoneUtils.format('+14155551234') // Returns: '+1 415 555 1234' (USA)
     * PhoneUtils.format('+447911123456') // Returns: '+44 7911 123456' (UK mobile)
     * PhoneUtils.format('+33612345678') // Returns: '+33 6 12 34 56 78' (France)
     */
    format(phone) {
        const normalized = this.normalize(phone);
        
        // Spain +34: +34 XXX XXX XXX (12 chars: +34 + 9 digits)
        if (normalized.startsWith('+34') && normalized.length === 12) {
            return normalized.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        
        // USA/Canada +1: +1 XXX XXX XXXX (12 chars: +1 + 10 digits)
        if (normalized.startsWith('+1') && normalized.length === 12) {
            return normalized.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
        }
        
        // UK +44: Variable length, typically 10 digits after +44
        // Mobile: +44 7XXX XXXXXX
        // Landline London: +44 20 XXXX XXXX
        if (normalized.startsWith('+44') && normalized.length >= 12 && normalized.length <= 13) {
            // Mobile numbers (start with 7)
            if (normalized[3] === '7' && normalized.length === 13) {
                return normalized.replace(/(\+44)(\d{4})(\d{6})/, '$1 $2 $3');
            }
            // Landline with 2-digit area code (like London 20) or 3-digit area code
            if (normalized.length === 13) {
                // Try 2-digit area code format first
                const areaCode = normalized.substring(3, 5);
                if (['20', '23', '24', '28', '29'].includes(areaCode)) {
                    return normalized.replace(/(\+44)(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4');
                }
                // Fall back to 3-digit area code
                return normalized.replace(/(\+44)(\d{3})(\d{7})/, '$1 $2 $3');
            }
        }
        
        // France +33: +33 X XX XX XX XX (12 chars: +33 + 9 digits)
        if (normalized.startsWith('+33') && normalized.length === 12) {
            return normalized.replace(/(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
        }
        
        // Germany +49: Variable length (10-11 digits typical)
        // Format: +49 XXX XXXXXXXX or +49 XXXX XXXXXXX
        if (normalized.startsWith('+49')) {
            // Mobile (starts with 15, 16, or 17)
            const mobilePrefix = normalized.substring(3, 5);
            if (normalized.length === 13 && ['15', '16', '17'].includes(mobilePrefix)) {
                return normalized.replace(/(\+49)(\d{3})(\d{8})/, '$1 $2 $3');
            }
            // Berlin (30), Munich (89), Hamburg (40), Frankfurt (69) - 2 digit area codes
            if (normalized.length >= 13 && normalized.length <= 14) {
                const areaCode = normalized.substring(3, 5);
                if (['30', '89', '40', '69'].includes(areaCode)) {
                    return normalized.replace(/(\+49)(\d{2})(\d+)/, '$1 $2 $3');
                }
            }
            // Other area codes (3-5 digits)
            if (normalized.length >= 12 && normalized.length <= 15) {
                return normalized.replace(/(\+49)(\d{3})(\d+)/, '$1 $2 $3');
            }
        }
        
        // For other countries or non-standard formats, return normalized format
        return normalized;
    }
};

// Export for module usage (ESM)
export default PhoneUtils;
