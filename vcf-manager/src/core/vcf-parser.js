/**
 * VCF Manager - VCF Parser Module
 * 
 * PURPOSE: Parse and export VCF (vCard) files
 * DEPENDENCIES: Config, PhoneUtils
 * USED BY: ContactManager
 * 
 * This module handles:
 * - Parsing VCF file content into contact objects
 * - Exporting contact objects back to VCF format
 * - Triggering browser download of VCF files
 * - Decoding quoted-printable encoding
 * 
 * SUPPORTED VCF FIELDS:
 * - FN (Full Name) - required
 * - N (Name) - fallback if FN missing
 * - TEL (Telephone) - array, supports multiple
 * - EMAIL - array, supports multiple
 * - ORG (Organization) - single value
 * - TITLE (Job Title) - optional
 * - ADR (Address) - optional
 * - NOTE - optional
 * - URL (Website) - optional
 * - BDAY (Birthday) - optional
 * 
 * AI MAINTENANCE NOTES:
 * - Uses VCF version 3.0 specification (RFC 2426)
 * - To add new field: update _parseBlock() and export()
 * - Phone numbers normalized during export for consistency
 * - Optional fields return undefined (not empty string) when missing
 */

import Config from '../config.js';
import PhoneUtils from '../utils/phone.js';
import Toast from '../utils/toast.js';

/**
 * @typedef {Object} Contact
 * @property {string} _id - Unique identifier (generated)
 * @property {string} fn - Full name (required)
 * @property {string[]} tels - Phone numbers (normalized)
 * @property {string[]} emails - Email addresses
 * @property {string} org - Organization name
 * @property {string} [title] - Job title (optional)
 * @property {string} [adr] - Address (optional)
 * @property {string} [note] - Notes (optional)
 * @property {string} [url] - Website URL (optional)
 * @property {string} [bday] - Birthday in YYYY-MM-DD format (optional)
 */

/**
 * VCF Parser utility object
 * @namespace VCFParser
 */
const VCFParser = {
    /**
     * Parse VCF file content into contact objects
     * 
     * PARSING LOGIC:
     * 1. Normalize line endings (Windows CRLF → Unix LF)
     * 2. Split by BEGIN:VCARD markers (case-insensitive)
     * 3. Filter out empty blocks
     * 4. Parse each vCard block into contact object
     * 
     * EXAMPLE VCF INPUT:
     * ```
     * BEGIN:VCARD
     * VERSION:3.0
     * FN:John Doe
     * TEL:612345678
     * EMAIL:john@example.com
     * END:VCARD
     * ```
     * 
     * @param {string} content - Raw VCF file content (may contain multiple contacts)
     * @returns {Contact[]} Array of parsed contact objects
     * 
     * @example
     * const contacts = VCFParser.parse(fileContent);
     * // Returns: [{ _id: '...', fn: 'John Doe', tels: ['612345678'], ... }]
     */
    parse(content) {
        // Normalize line endings to LF
        const blocks = content
            .replace(/\r\n/g, '\n')
            // Split by BEGIN:VCARD (case-insensitive)
            .split(/BEGIN:VCARD/i)
            // Filter blocks with meaningful content (>5 chars)
            .filter(b => b.trim().length > 5);

        // Parse each block into a contact object
        return blocks.map(block => this._parseBlock(block));
    },

    /**
     * Parse a single vCard block into a contact object
     * 
     * PARSING STRATEGY:
     * - get(key): Extract single field value
     * - getAll(key): Extract multiple field values (for TEL, EMAIL)
     * - Use FN field, fallback to N field, fallback to "No Name"
     * - Decode quoted-printable encoding
     * - Optional fields return undefined (not empty string)
     * 
     * AI MAINTENANCE NOTE:
     * To add new field:
     * 1. Add to return object
     * 2. Use get(KEY) for single value or getAll(KEY) for array
     * 3. Apply this._decode() to handle encoding
     * 4. Use || undefined for optional fields
     * 5. Update export() method to write new field
     * 
     * @private
     * @param {string} block - Single vCard text block
     * @returns {Contact} Parsed contact object
     */
    _parseBlock(block) {
        /**
         * Extract single field value from vCard block
         * Matches pattern: FIELD_NAME(;PARAMS)?:VALUE
         * @param {string} key - VCF field name (e.g., 'FN', 'TEL')
         * @returns {string} Field value or empty string
         */
        const get = (key) => {
            // Regex: ^KEY(optional params):VALUE$
            // Flags: i=case-insensitive, m=multiline
            const match = block.match(new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'im'));
            return match ? match[1] : '';
        };

        /**
         * Extract multiple field values (for fields that can appear multiple times)
         * @param {string} key - VCF field name
         * @returns {string[]} Array of field values
         */
        const getAll = (key) => {
            // Regex: ^KEY(optional params):VALUE$ (global, case-insensitive, multiline)
            const matches = block.match(new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'gim')) || [];
            // Extract value after colon
            return matches.map(line => line.split(':')[1] || '');
        };

        return {
            // Generate unique ID for internal tracking
            _id: this._generateId(),
            
            // Full name: try FN, then N, then default
            fn: this._decode(get('FN')) || this._decode(get('N').replace(/;/g, ' ')) || Config.messages.noName,
            
            // Phone numbers: can have multiple, decode each
            tels: getAll('TEL').map(t => this._decode(t)),
            
            // Emails: can have multiple, decode each
            emails: getAll('EMAIL').map(e => this._decode(e)),
            
            // Organization: single value
            org: this._decode(get('ORG')),
            
            // Optional fields: return undefined if not present (for merge logic)
            title: this._decode(get('TITLE')) || undefined,
            adr: this._decode(get('ADR')?.replace(/;/g, ' ')) || undefined,
            note: this._decode(get('NOTE')) || undefined,
            url: this._decode(get('URL')) || undefined,
            bday: this._decode(get('BDAY')) || undefined
        };
    },

    /**
     * Generate unique ID for a contact
     * 
     * ID FORMAT: Random base-36 string + timestamp
     * EXAMPLE: 'k2x9f8h1643723456789'
     * 
     * UNIQUENESS: Combination of random string and timestamp ensures
     * no collisions even when parsing multiple contacts simultaneously
     * 
     * @private
     * @returns {string} Unique identifier
     */
    _generateId() {
        return Math.random().toString(36).substr(2) + Date.now();
    },

    /**
     * Decode quoted-printable encoding (RFC 2047)
     * 
     * VCF files may use quoted-printable encoding for special characters
     * Format: =XX where XX is hex code for character
     * Example: '=C3=A1' → 'á'
     * 
     * DECODING STRATEGY:
     * 1. Check if string contains '=' (encoding indicator)
     * 2. Replace =XX patterns with %XX for decodeURIComponent
     * 3. Decode using decodeURIComponent
     * 4. If decoding fails, return trimmed original
     * 
     * @private
     * @param {string} str - Potentially encoded string
     * @returns {string} Decoded string (trimmed)
     */
    _decode(str) {
        if (!str) return '';
        try {
            // Only decode if contains '=' (encoding marker)
            return str.includes('=') 
                ? decodeURIComponent(str.replace(/=([A-F0-9]{2})/g, '%$1').trim()) 
                : str.trim();
        } catch (e) {
            // If decoding fails, return original trimmed string
            return str.trim();
        }
    },

    /**
     * Export contacts to VCF format
     * 
     * EXPORT LOGIC:
     * 1. For each contact, create BEGIN/END:VCARD block
     * 2. Use VCF version 3.0
     * 3. Normalize phone numbers for consistency
     * 4. Include optional fields only if defined
     * 
     * VCF FIELD MAPPING:
     * - FN: Full name (contact.fn)
     * - N: Structured name (derived from fn)
     * - TEL: Phone numbers (normalized via PhoneUtils)
     * - EMAIL: Email addresses
     * - ORG: Organization
     * - TITLE: Job title (if present)
     * - ADR: Address (if present)
     * - NOTE: Notes (if present)
     * - URL: Website (if present)
     * - BDAY: Birthday (if present)
     * 
     * AI MAINTENANCE NOTE:
     * To export new field:
     * 1. Add field to contact object in _parseBlock()
     * 2. Add conditional export here: if (contact.newField) output += ...
     * 3. Follow VCF 3.0 field format
     * 
     * @param {Contact[]} contacts - Array of contact objects to export
     * @returns {string} Complete VCF file content (all contacts)
     * 
     * @example
     * const vcfContent = VCFParser.export(contacts);
     * // Returns: "BEGIN:VCARD\nVERSION:3.0\nFN:John..."
     */
    export(contacts) {
        let output = '';

        contacts.forEach(contact => {
            // Start vCard block
            output += 'BEGIN:VCARD\nVERSION:3.0\n';
            
            // Required fields: FN (full name) and N (structured name)
            output += `FN:${contact.fn}\nN:;${contact.fn};;;\n`;
            
            // Phone numbers: normalize and mark as CELL type
            contact.tels.forEach(tel => {
                output += `TEL;TYPE=CELL:${PhoneUtils.normalize(tel)}\n`;
            });
            
            // Email addresses
            contact.emails.forEach(email => {
                output += `EMAIL:${email}\n`;
            });
            
            // Organization (always included, may be empty string)
            if (contact.org) output += `ORG:${contact.org}\n`;
            
            // Optional fields: only include if defined
            if (contact.title) output += `TITLE:${contact.title}\n`;
            if (contact.adr) output += `ADR:;;${contact.adr};;;;\n`;
            if (contact.note) output += `NOTE:${contact.note}\n`;
            if (contact.url) output += `URL:${contact.url}\n`;
            if (contact.bday) output += `BDAY:${contact.bday}\n`;
            
            // End vCard block
            output += 'END:VCARD\n';
        });

        return output;
    },

    /**
     * Download contacts as VCF file (trigger browser download)
     * 
     * DOWNLOAD PROCESS:
     * 1. Validate contacts array is not empty
     * 2. Export contacts to VCF format
     * 3. Create Blob with VCF content
     * 4. Create temporary download link
     * 5. Trigger click to download
     * 6. Clean up temporary link
     * 
     * FILENAME FORMAT: contactos_[timestamp].vcf
     * Example: contactos_1643723456789.vcf
     * 
     * @param {Contact[]} contacts - Array of contact objects to download
     * @returns {void}
     * 
     * @example
     * VCFParser.download(core.contacts); // Downloads all contacts
     */
    download(contacts) {
        // Validate non-empty list
        if (contacts.length === 0) {
            Toast.warning(Config.messages.emptyList);
            return;
        }

        // Convert contacts to VCF format
        const content = this.export(contacts);
        
        // Create Blob with proper MIME type
        const blob = new Blob([content], { type: 'text/vcard' });
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${Config.ui.defaultFileName}_${Date.now()}.vcf`;
        
        // Trigger download by programmatically clicking link
        document.body.appendChild(link);
        link.click();
        
        // Clean up: remove link from DOM and revoke object URL to free memory
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
};

// Export for module usage (ESM)
export default VCFParser;
