/**
 * VCF Manager - VCF Parser
 * Handles parsing and exporting VCF (vCard) files
 */

const VCFParser = {
    /**
     * Parse VCF file content into contact objects
     * @param {string} content - Raw VCF file content
     * @returns {Array} Array of contact objects
     */
    parse(content) {
        const blocks = content
            .replace(/\r\n/g, '\n')
            .split(/BEGIN:VCARD/i)
            .filter(b => b.trim().length > 5);

        return blocks.map(block => this._parseBlock(block));
    },

    /**
     * Parse a single vCard block
     * @private
     */
    _parseBlock(block) {
        const get = (key) => {
            const match = block.match(new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'im'));
            return match ? match[1] : '';
        };

        const getAll = (key) => {
            const matches = block.match(new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'gim')) || [];
            return matches.map(line => line.split(':')[1] || '');
        };

        return {
            _id: this._generateId(),
            fn: this._decode(get('FN')) || this._decode(get('N').replace(/;/g, ' ')) || Config.messages.noName,
            tels: getAll('TEL').map(t => this._decode(t)),
            emails: getAll('EMAIL').map(e => this._decode(e)),
            org: this._decode(get('ORG')),
            title: this._decode(get('TITLE')) || undefined,
            adr: this._decode(get('ADR')?.replace(/;/g, ' ')) || undefined,
            note: this._decode(get('NOTE')) || undefined,
            url: this._decode(get('URL')) || undefined,
            bday: this._decode(get('BDAY')) || undefined
        };
    },

    /**
     * Generate unique ID for a contact
     * @private
     */
    _generateId() {
        return Math.random().toString(36).substr(2) + Date.now();
    },

    /**
     * Decode quoted-printable encoding
     * @private
     */
    _decode(str) {
        if (!str) return '';
        try {
            return str.includes('=') 
                ? decodeURIComponent(str.replace(/=([A-F0-9]{2})/g, '%$1').trim()) 
                : str.trim();
        } catch (e) {
            return str.trim();
        }
    },

    /**
     * Export contacts to VCF format
     * @param {Array} contacts - Array of contact objects
     * @returns {string} VCF file content
     */
    export(contacts) {
        let output = '';

        contacts.forEach(contact => {
            output += 'BEGIN:VCARD\nVERSION:3.0\n';
            output += `FN:${contact.fn}\nN:;${contact.fn};;;\n`;
            
            contact.tels.forEach(tel => {
                output += `TEL;TYPE=CELL:${PhoneUtils.normalize(tel)}\n`;
            });
            
            contact.emails.forEach(email => {
                output += `EMAIL:${email}\n`;
            });
            
            if (contact.org) output += `ORG:${contact.org}\n`;
            if (contact.title) output += `TITLE:${contact.title}\n`;
            if (contact.adr) output += `ADR:;;${contact.adr};;;;\n`;
            if (contact.note) output += `NOTE:${contact.note}\n`;
            if (contact.url) output += `URL:${contact.url}\n`;
            if (contact.bday) output += `BDAY:${contact.bday}\n`;
            
            output += 'END:VCARD\n';
        });

        return output;
    },

    /**
     * Download contacts as VCF file
     * @param {Array} contacts - Array of contact objects
     */
    download(contacts) {
        if (contacts.length === 0) {
            alert(Config.messages.emptyList);
            return;
        }

        const content = this.export(contacts);
        const blob = new Blob([content], { type: 'text/vcard' });
        const link = document.createElement('a');
        
        link.href = URL.createObjectURL(blob);
        link.download = `${Config.ui.defaultFileName}_${Date.now()}.vcf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VCFParser;
}
