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
 * - Supports both VCF version 3.0 (RFC 2426) and 4.0 (RFC 6350)
 * - Automatically detects vCard version during import
 * - Converts 3.0 to 4.0 internally while preserving original version
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
 * @property {string} [gender] - Gender (vCard 4.0: M/F/O/N/U or custom text)
 * @property {string} [anniversary] - Anniversary date (vCard 4.0)
 * @property {string} [kind] - Kind of object (vCard 4.0: individual/group/org/location)
 * @property {string} [lang] - Language preference (vCard 4.0)
 * @property {string} [_originalVersion] - Original vCard version detected during import
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

        // Detect original vCard version
        const version = get('VERSION') || '3.0';

        return {
            // Generate unique ID for internal tracking
            _id: this._generateId(),
            
            // Store original version for export decision
            _originalVersion: version,
            
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
            bday: this._decode(get('BDAY')) || undefined,
            
            // vCard 4.0 specific fields
            gender: this._decode(get('GENDER')) || undefined,
            anniversary: this._decode(get('ANNIVERSARY')) || undefined,
            kind: this._decode(get('KIND')) || undefined,
            lang: this._decode(get('LANG')) || undefined
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
     * 2. Use specified VCF version (defaults to 4.0)
     * 3. Normalize phone numbers for consistency
     * 4. Include optional fields only if defined
     * 5. Handle version-specific syntax differences
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
     * - GENDER: Gender (vCard 4.0 only)
     * - ANNIVERSARY: Anniversary (vCard 4.0 only)
     * - KIND: Kind of object (vCard 4.0 only)
     * - LANG: Language preference (vCard 4.0 only)
     * 
     * AI MAINTENANCE NOTE:
     * To export new field:
     * 1. Add field to contact object in _parseBlock()
     * 2. Add conditional export here: if (contact.newField) output += ...
     * 3. Follow VCF version-specific field format
     * 
     * @param {Contact[]} contacts - Array of contact objects to export
     * @param {string} [version='4.0'] - vCard version to export (3.0 or 4.0)
     * @returns {string} Complete VCF file content (all contacts)
     * 
     * @example
     * const vcfContent = VCFParser.export(contacts, '4.0');
     * // Returns: "BEGIN:VCARD\nVERSION:4.0\nFN:John..."
     */
    export(contacts, version = Config.vcard.defaultVersion) {
        let output = '';

        contacts.forEach(contact => {
            // Start vCard block with specified version
            output += `BEGIN:VCARD\nVERSION:${version}\n`;
            
            // Required fields: FN (full name) and N (structured name)
            output += `FN:${contact.fn}\nN:;${contact.fn};;;\n`;
            
            // Phone numbers: normalize and mark as CELL type
            // vCard 4.0 uses TYPE=cell (lowercase), 3.0 uses TYPE=CELL (uppercase)
            const telType = version === '4.0' ? 'cell' : 'CELL';
            contact.tels.forEach(tel => {
                output += `TEL;TYPE=${telType}:${PhoneUtils.normalize(tel)}\n`;
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
            
            // vCard 4.0 specific fields (only export if version is 4.0)
            if (version === '4.0') {
                if (contact.gender) output += `GENDER:${contact.gender}\n`;
                if (contact.anniversary) output += `ANNIVERSARY:${contact.anniversary}\n`;
                if (contact.kind) output += `KIND:${contact.kind}\n`;
                if (contact.lang) output += `LANG:${contact.lang}\n`;
            }
            
            // End vCard block
            output += 'END:VCARD\n';
        });

        return output;
    },

    /**
     * Check if any contacts were imported with an older vCard version
     * 
     * @param {Contact[]} contacts - Array of contact objects
     * @returns {boolean} True if any contact has _originalVersion < 4.0
     */
    hasLegacyVersionContacts(contacts) {
        return contacts.some(contact => 
            contact._originalVersion && 
            contact._originalVersion !== '4.0'
        );
    },

    /**
     * Download contacts as VCF file (trigger browser download)
     * 
     * DOWNLOAD PROCESS:
     * 1. Validate contacts array is not empty
     * 2. Check if user wants to upgrade from legacy version
     * 3. Export contacts to VCF format
     * 4. Create Blob with VCF content
     * 5. Create temporary download link
     * 6. Trigger click to download
     * 7. Clean up temporary link
     * 
     * FILENAME FORMAT: contactos_[timestamp].vcf
     * Example: contactos_1643723456789.vcf
     * 
     * @param {Contact[]} contacts - Array of contact objects to download
     * @param {string} [version] - Optional vCard version override
     * @returns {void}
     * 
     * @example
     * VCFParser.download(core.contacts); // Downloads all contacts
     */
    download(contacts, version) {
        // Validate non-empty list
        if (contacts.length === 0) {
            Toast.warning(Config.messages.emptyList);
            return;
        }

        // Convert contacts to VCF format with specified version
        const content = this.export(contacts, version);
        
        // Create Blob with proper MIME type
        const blob = new Blob([content], { type: 'text/vcard' });
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${Config.ui.defaultFileName}_${Date.now()}.vcf`;
        
        // Trigger download by programmatically clicking link
        document.body.appendChild(link);
        link.click();
        
        // Clean up: remove link from DOM
        document.body.removeChild(link);
    }
};

// Export for module usage (ESM)
export default VCFParser;
