/**
 * VCF Manager - Contact Manager
 * Core system for managing contacts, selection, and UI rendering
 */

class ContactManager {
    constructor() {
        this.contacts = [];
        this.selected = new Set();
        this.selectOrder = [];
        this.filterStr = '';
        this.sortAZ = false;
    }

    /**
     * Initialize DOM event listeners
     */
    init() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.loadFile(e.target.files[0]));
        }
    }

    /**
     * Load contacts from a VCF file
     * @param {File} file - VCF file to load
     */
    loadFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.contacts = VCFParser.parse(e.target.result);
            this.render();
        };
        reader.readAsText(file);
    }

    /**
     * Export all contacts to VCF file
     */
    exportVCF() {
        VCFParser.download(this.contacts);
    }

    /**
     * Set filter string and re-render
     * @param {string} value - Filter string
     */
    setFilter(value) {
        this.filterStr = value.toLowerCase();
        this.render();
    }

    /**
     * Toggle sort order between alphabetical and creation order
     */
    toggleSort() {
        this.sortAZ = !this.sortAZ;
        this.render();
        alert(this.sortAZ ? Config.messages.sortAlpha : Config.messages.sortCreation);
    }

    /**
     * Render the contact grid
     */
    render() {
        const grid = document.getElementById('grid');
        if (!grid) return;

        grid.innerHTML = '';

        // Update stats
        const statDisplay = document.getElementById('statDisplay');
        const btnExport = document.getElementById('btnExport');
        
        if (statDisplay) statDisplay.innerText = `${this.contacts.length} contactos`;
        if (btnExport) btnExport.innerText = `Exportar (${this.contacts.length})`;

        // Filter contacts
        let visible = this.contacts.filter(c =>
            c.fn.toLowerCase().includes(this.filterStr) ||
            c.tels.some(t => t.includes(this.filterStr))
        );

        // Sort if enabled
        if (this.sortAZ) {
            visible.sort((a, b) => a.fn.localeCompare(b.fn));
        }

        // Show empty state
        if (visible.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#94a3b8">${Config.messages.noData}</div>`;
            return;
        }

        // Render contact cards
        visible.forEach(contact => {
            const card = this._createCard(contact);
            grid.appendChild(card);
        });

        // Update FAB
        this._updateFAB();
    }

    /**
     * Create a contact card element
     * @private
     */
    _createCard(contact) {
        const isSelected = this.selected.has(contact._id);
        const selectionIndex = this.selectOrder.indexOf(contact._id);

        const card = document.createElement('div');
        card.className = `card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => this.toggleSelect(contact._id);

        const telsHtml = contact.tels
            .slice(0, Config.ui.maxTelsDisplay)
            .map(t => `<span>📞 ${PhoneUtils.format(t)}</span>`)
            .join('');

        const moreTels = contact.tels.length > Config.ui.maxTelsDisplay
            ? `<small style="color:#94a3b8">+${contact.tels.length - Config.ui.maxTelsDisplay} mas</small>`
            : '';

        card.innerHTML = `
            <div class="badge">${selectionIndex + 1}</div>
            <div style="font-weight:bold; font-size:1.05rem; margin-bottom:4px;">${contact.fn}</div>
            <div style="font-size:0.8rem; color:#64748b; margin-bottom:8px;">${contact.org || ''}</div>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:0.85rem; color:#334155;">
                ${telsHtml}
                ${moreTels}
            </div>
        `;

        return card;
    }

    /**
     * Update the floating action button state
     * @private
     */
    _updateFAB() {
        const fab = document.getElementById('fab');
        const selCount = document.getElementById('selCount');
        const fabActionText = document.getElementById('fabActionText');

        if (!fab) return;

        if (this.selected.size > 0) {
            fab.classList.add('visible');
            if (selCount) selCount.innerText = this.selected.size;
            if (fabActionText) {
                fabActionText.innerText = this.selected.size === 1 ? "✏️ EDITAR" : "⚡ FUSIONAR";
            }
        } else {
            fab.classList.remove('visible');
        }
    }

    /**
     * Toggle contact selection
     * @param {string} id - Contact ID
     */
    toggleSelect(id) {
        if (this.selected.has(id)) {
            this.selected.delete(id);
            this.selectOrder = this.selectOrder.filter(x => x !== id);
        } else {
            this.selected.add(id);
            this.selectOrder.push(id);
        }
        this.render();
    }

    /**
     * Select all contacts
     */
    selectAll() {
        this.contacts.forEach(c => {
            if (!this.selected.has(c._id)) {
                this.selected.add(c._id);
                this.selectOrder.push(c._id);
            }
        });
        this.render();
    }

    /**
     * Deselect all contacts
     */
    deselectAll() {
        this.selected.clear();
        this.selectOrder = [];
        this.render();
    }

    /**
     * Delete selected contacts
     */
    deleteSelected() {
        if (!confirm(Config.messages.confirmDelete(this.selected.size))) return;
        this.contacts = this.contacts.filter(c => !this.selected.has(c._id));
        this.deselectAll();
    }

    /**
     * Clear all contacts
     */
    clearAll() {
        if (confirm(Config.messages.confirmClear)) {
            this.contacts = [];
            this.deselectAll();
        }
    }

    /**
     * Find a contact by ID
     * @param {string} id - Contact ID
     * @returns {Object|undefined} Contact object or undefined
     */
    findById(id) {
        return this.contacts.find(c => c._id === id);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactManager;
}
