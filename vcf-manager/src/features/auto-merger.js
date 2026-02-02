/**
 * VCF Manager - Auto Merger
 * Handles automatic duplicate detection and merge queue
 */

class AutoMerger {
    constructor() {
        this.queue = [];
        this.active = false;
    }

    /**
     * Start auto-merge process
     * @param {string} mode - Detection mode: 'name' or 'phone'
     */
    start(mode) {
        if (core.contacts.length === 0) {
            return alert(Config.messages.emptyAgenda);
        }

        const groups = mode === 'name' 
            ? this._findDuplicatesByName() 
            : this._findDuplicatesByPhone();

        this.queue = groups;

        if (this.queue.length === 0) {
            return alert(Config.messages.noDuplicates);
        }

        this.active = true;
        this.processNext();
    }

    /**
     * Find duplicate contacts by name
     * @private
     */
    _findDuplicatesByName() {
        const groups = {};

        core.contacts.forEach(contact => {
            const key = contact.fn.toLowerCase().trim();
            if (key.length > 0) {
                if (!groups[key]) groups[key] = [];
                groups[key].push(contact._id);
            }
        });

        return Object.values(groups).filter(g => g.length > 1);
    }

    /**
     * Find duplicate contacts by phone number
     * @private
     */
    _findDuplicatesByPhone() {
        const phoneMap = {};

        core.contacts.forEach(contact => {
            contact.tels.forEach(tel => {
                const normalized = PhoneUtils.normalize(tel);
                if (normalized) {
                    if (!phoneMap[normalized]) phoneMap[normalized] = [];
                    phoneMap[normalized].push(contact._id);
                }
            });
        });

        // Deduplicate groups (same contacts may share multiple phones)
        const uniqueGroups = new Set();
        Object.values(phoneMap).forEach(ids => {
            const unique = [...new Set(ids)];
            if (unique.length > 1) {
                uniqueGroups.add(JSON.stringify(unique.sort()));
            }
        });

        return Array.from(uniqueGroups).map(json => JSON.parse(json));
    }

    /**
     * Process the next group in the queue
     */
    processNext() {
        while (this.queue.length > 0) {
            const nextGroupIds = this.queue[0];
            const validContacts = nextGroupIds
                .map(id => core.findById(id))
                .filter(c => c);

            if (validContacts.length < 2) {
                this.queue.shift();
                continue;
            }

            this._showGroup(validContacts);
            this.queue.shift();
            return;
        }

        // Queue complete
        this.active = false;
        this._hideUI();
        alert(Config.messages.autoMergeComplete);
    }

    /**
     * Show a group of duplicates for merging
     * @private
     */
    _showGroup(contacts) {
        // Update queue toast
        const toast = document.getElementById('queueToast');
        if (toast) {
            toast.innerText = `Cola: ${this.queue.length + 1} grupos restantes`;
            toast.style.display = 'block';
        }

        const hint = document.getElementById('autoMergeHint');
        if (hint) hint.style.display = 'block';

        // Sort by name length (longer name = more complete)
        contacts.sort((a, b) => b.fn.length - a.fn.length);

        // Select contacts
        core.selected.clear();
        core.selectOrder = [];
        contacts.forEach(c => {
            core.selected.add(c._id);
            core.selectOrder.push(c._id);
        });

        // Open merge tool
        mergeTool.init();
    }

    /**
     * Hide auto-merge UI elements
     * @private
     */
    _hideUI() {
        const toast = document.getElementById('queueToast');
        const hint = document.getElementById('autoMergeHint');
        
        if (toast) toast.style.display = 'none';
        if (hint) hint.style.display = 'none';
    }

    /**
     * Cancel auto-merge process
     */
    cancel() {
        this.active = false;
        this._hideUI();
        alert(Config.messages.autoMergeCancelled);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoMerger;
}
