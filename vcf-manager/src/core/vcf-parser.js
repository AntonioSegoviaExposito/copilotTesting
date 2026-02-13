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
 * SUPPORTED VCF FIELDS (v4.0):
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
 * - PHOTO (Photo) - optional, supports URI and data URI
 * - GENDER (Gender) - optional (v4.0)
 * - KIND (Entity type) - optional (v4.0, defaults to "individual")
 * - ANNIVERSARY (Anniversary) - optional (v4.0)
 * - LANG (Language) - optional (v4.0)
 * - IMPP (Instant Messaging) - array (v4.0)
 * - GEO (Geographic position) - optional (v4.0)
 * - TZ (Time zone) - optional (v4.0)
 * - NICKNAME (Nickname) - optional
 * - CATEGORIES (Categories) - optional
 * - ROLE (Role) - optional
 * 
 * AI MAINTENANCE NOTES:
 * - Uses VCF version 4.0 specification (RFC 6350)
 * - Imports v2.1/3.0 vCards and converts to v4.0 on export
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
 * @property {string} [photo] - Photo URI or data URI (optional, v4.0)
 * @property {string} [gender] - Gender (optional, v4.0)
 * @property {string} [kind] - Entity type (optional, v4.0, defaults to "individual")
 * @property {string} [anniversary] - Anniversary date (optional, v4.0)
 * @property {string} [lang] - Preferred language (optional, v4.0)
 * @property {string[]} [impp] - Instant messaging addresses (optional, v4.0)
 * @property {string} [geo] - Geographic position (optional, v4.0)
 * @property {string} [tz] - Time zone (optional, v4.0)
 * @property {string} [nickname] - Nickname (optional)
 * @property {string} [categories] - Categories (optional)
 * @property {string} [role] - Role (optional)
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
            // Extract value after first colon (handles URIs with multiple colons)
            return matches.map(line => {
                const colonIndex = line.indexOf(':');
                return colonIndex >= 0 ? line.substring(colonIndex + 1) : '';
            });
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
            bday: this._decode(get('BDAY')) || undefined,
            
            // vCard 4.0 fields
            photo: this._decode(get('PHOTO')) || undefined,
            gender: this._decode(get('GENDER')) || undefined,
            kind: this._decode(get('KIND')) || undefined,
            anniversary: this._decode(get('ANNIVERSARY')) || undefined,
            lang: this._decode(get('LANG')) || undefined,
            impp: (() => {
                const imppValues = getAll('IMPP').map(i => this._decode(i)).filter(i => i);
                return imppValues.length > 0 ? imppValues : undefined;
            })(),
            geo: this._decode(get('GEO')) || undefined,
            tz: this._decode(get('TZ')) || undefined,
            nickname: this._decode(get('NICKNAME')) || undefined,
            categories: this._decode(get('CATEGORIES')) || undefined,
            role: this._decode(get('ROLE')) || undefined
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
     * Export contacts to VCF format (version 4.0)
     * 
     * EXPORT LOGIC:
     * 1. For each contact, create BEGIN/END:VCARD block
     * 2. Use VCF version 4.0 (RFC 6350)
     * 3. VERSION must appear immediately after BEGIN:VCARD
     * 4. Normalize phone numbers for consistency
     * 5. Include optional fields only if defined
     * 6. Use UTF-8 encoding (mandatory in v4.0)
     * 
     * VCF FIELD MAPPING (v4.0):
     * - FN: Full name (contact.fn)
     * - N: Structured name (derived from fn)
     * - TEL: Phone numbers (normalized via PhoneUtils, with TYPE parameter)
     * - EMAIL: Email addresses (with TYPE parameter)
     * - ORG: Organization
     * - TITLE: Job title (if present)
     * - ADR: Address (if present)
     * - NOTE: Notes (if present)
     * - URL: Website (if present)
     * - BDAY: Birthday (if present)
     * - PHOTO: Photo URI or data URI (if present, v4.0)
     * - GENDER: Gender (if present, v4.0)
     * - KIND: Entity type (if present, v4.0)
     * - ANNIVERSARY: Anniversary (if present, v4.0)
     * - LANG: Language (if present, v4.0)
     * - IMPP: Instant messaging (if present, v4.0)
     * - GEO: Geographic position (if present, v4.0)
     * - TZ: Time zone (if present, v4.0)
     * - NICKNAME: Nickname (if present)
     * - CATEGORIES: Categories (if present)
     * - ROLE: Role (if present)
     * 
     * AI MAINTENANCE NOTE:
     * To export new field:
     * 1. Add field to contact object in _parseBlock()
     * 2. Add conditional export here: if (contact.newField) output += ...
     * 3. Follow VCF 4.0 field format
     * 
     * @param {Contact[]} contacts - Array of contact objects to export
     * @returns {string} Complete VCF file content (all contacts)
     * 
     * @example
     * const vcfContent = VCFParser.export(contacts);
     * // Returns: "BEGIN:VCARD\nVERSION:4.0\nFN:John..."
     */
    export(contacts) {
        let output = '';

        contacts.forEach(contact => {
            // Start vCard block
            output += 'BEGIN:VCARD\n';
            
            // VERSION must come immediately after BEGIN:VCARD in v4.0
            output += 'VERSION:4.0\n';
            
            // Required fields: FN (full name) and N (structured name)
            output += `FN:${contact.fn}\nN:;${contact.fn};;;\n`;
            
            // KIND field (entity type, v4.0)
            // Default to "individual" if not specified
            if (contact.kind) {
                output += `KIND:${contact.kind}\n`;
            }
            
            // Phone numbers: normalize and use TYPE parameter (v4.0 style)
            contact.tels.forEach(tel => {
                output += `TEL;TYPE=cell,voice;VALUE=uri:tel:${PhoneUtils.normalize(tel)}\n`;
            });
            
            // Email addresses with TYPE parameter
            contact.emails.forEach(email => {
                output += `EMAIL;TYPE=internet:${email}\n`;
            });
            
            // Organization (always included, may be empty string)
            if (contact.org) output += `ORG:${contact.org}\n`;
            
            // Optional v3.0 fields: only include if defined
            if (contact.title) output += `TITLE:${contact.title}\n`;
            if (contact.adr) output += `ADR:;;${contact.adr};;;;\n`;
            if (contact.note) output += `NOTE:${contact.note}\n`;
            if (contact.url) output += `URL:${contact.url}\n`;
            if (contact.bday) output += `BDAY:${contact.bday}\n`;
            if (contact.nickname) output += `NICKNAME:${contact.nickname}\n`;
            if (contact.role) output += `ROLE:${contact.role}\n`;
            if (contact.categories) output += `CATEGORIES:${contact.categories}\n`;
            
            // vCard 4.0 specific fields
            if (contact.photo) {
                // Check if it's a data URI or regular URI
                if (contact.photo.startsWith('data:')) {
                    output += `PHOTO:${contact.photo}\n`;
                } else {
                    // Assume it's a URL, add MEDIATYPE parameter
                    // Extract file extension and map to MIME type
                    const extensionMatch = contact.photo.match(/\.([^.]+)$/i);
                    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
                    const mimeTypes = {
                        'jpg': 'image/jpeg',
                        'jpeg': 'image/jpeg',
                        'png': 'image/png',
                        'gif': 'image/gif'
                    };
                    const mediaType = mimeTypes[extension] || 'image/jpeg';
                    output += `PHOTO;MEDIATYPE=${mediaType}:${contact.photo}\n`;
                }
            }
            if (contact.gender) output += `GENDER:${contact.gender}\n`;
            if (contact.anniversary) output += `ANNIVERSARY:${contact.anniversary}\n`;
            if (contact.lang) output += `LANG:${contact.lang}\n`;
            if (contact.geo) output += `GEO:${contact.geo}\n`;
            if (contact.tz) output += `TZ:${contact.tz}\n`;
            
            // IMPP (instant messaging): can have multiple
            if (contact.impp && contact.impp.length > 0) {
                contact.impp.forEach(impp => {
                    output += `IMPP:${impp}\n`;
                });
            }
            
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
