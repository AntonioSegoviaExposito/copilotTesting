/**
 * VCF Manager - Merge Tool
 * Handles contact merging and editing UI
 */

class MergeTool {
    constructor() {
        this.pending = null;
    }

    /**
     * Initialize merge tool with selected contacts
     */
    init() {
        if (core.selectOrder.length < 1) return;
        this.buildPending(core.selectOrder);
        this.renderUI();
    }

    /**
     * Swap the master contact
     * @param {string} newMasterId - ID of new master contact
     */
    swapMaster(newMasterId) {
        if (newMasterId === this.pending.targetId) return;

        const oldOrder = this.pending.idsToRemove;
        const newOrder = [newMasterId, ...oldOrder.filter(id => id !== newMasterId)];
        
        this.buildPending(newOrder);
        this.renderUI();
    }

    /**
     * Build pending merge data from contact IDs
     * @param {Array} ids - Array of contact IDs (first is master)
     */
    buildPending(ids) {
        const masterId = ids[0];
        const masterContact = core.findById(masterId);
        const slaves = ids.slice(1)
            .map(id => core.findById(id))
            .filter(x => x);

        // Combine phone numbers (normalized, deduplicated)
        const combinedTels = new Set();
        masterContact.tels.forEach(t => combinedTels.add(PhoneUtils.normalize(t)));
        slaves.forEach(s => s.tels.forEach(t => combinedTels.add(PhoneUtils.normalize(t))));

        // Combine emails (deduplicated)
        const combinedEmails = new Set(masterContact.emails);
        slaves.forEach(s => s.emails.forEach(e => combinedEmails.add(e)));

        // Build pending data (master fields take priority, then first slave with value)
        this.pending = {
            targetId: masterId,
            idsToRemove: ids,
            data: {
                fn: masterContact.fn,
                tels: Array.from(combinedTels),
                emails: Array.from(combinedEmails),
                org: masterContact.org || slaves.find(s => s.org)?.org || '',
                title: masterContact.title || slaves.find(s => s.title)?.title || undefined,
                adr: masterContact.adr || slaves.find(s => s.adr)?.adr || undefined,
                note: masterContact.note || slaves.find(s => s.note)?.note || undefined,
                url: masterContact.url || slaves.find(s => s.url)?.url || undefined,
                bday: masterContact.bday || slaves.find(s => s.bday)?.bday || undefined
            },
            originalObjects: [masterContact, ...slaves]
        };
    }

    /**
     * Render the merge modal UI
     */
    renderUI() {
        const modal = document.getElementById('mergeModal');
        if (modal) modal.style.display = 'flex';

        const slavesCount = this.pending.originalObjects.length - 1;
        const title = document.getElementById('modalTitle');
        if (title) {
            title.innerText = slavesCount > 0 ? `Fusion (${slavesCount + 1})` : "Edicion";
        }

        this._renderSourcesList();
        this.renderResultForm();
    }

    /**
     * Render the sources list (master/slave contacts)
     * @private
     */
    _renderSourcesList() {
        const list = document.getElementById('mergeSourcesList');
        if (!list) return;

        list.innerHTML = '';

        this.pending.originalObjects.forEach((contact, index) => {
            const isMaster = index === 0;
            const onclick = isMaster ? '' : `onclick="mergeTool.swapMaster('${contact._id}')"`;

            list.innerHTML += `
                <div class="source-item ${isMaster ? 'master' : ''}" ${onclick}>
                    <div style="font-weight:bold; color:${isMaster ? 'var(--primary)' : '#64748b'}; font-size:0.7rem; margin-bottom:5px;">
                        ${isMaster ? '<span class="master-badge">MASTER</span>' : '<span class="slave-badge">SLAVE</span>'}
                        <span class="click-hint">👈 Convertir en Master</span>
                    </div>
                    <div style="font-weight:bold; font-size:1rem">${contact.fn}</div>
                    <div style="font-size:0.8rem; margin-top:5px; color:#475569">
                        ${contact.tels.map(t => `<div>${t}</div>`).join('')}
                    </div>
                </div>
            `;
        });
    }

    /**
     * Render the result form with merged data
     */
    renderResultForm() {
        const container = document.getElementById('mergeResultForm');
        if (!container) return;

        const data = this.pending.data;

        // Helper to create text input
        const textInput = (label, key, value) => `
            <div class="input-group">
                <div class="input-header"><span class="input-label">${label}</span></div>
                <input class="input-field" value="${value}" oninput="mergeTool.pending.data.${key} = this.value">
            </div>
        `;

        let html = `
            ${textInput('Nombre Completo', 'fn', data.fn)}
            
            <div class="input-group">
                <div class="input-header">
                    <span class="input-label">Telefonos (${data.tels.length})</span>
                    <button class="btn btn-outline btn-sm" onclick="mergeTool.addField('tels')">+ Anadir</button>
                </div>
                ${data.tels.map((tel, i) => `
                    <div class="item-row">
                        <input class="input-field" value="${PhoneUtils.format(tel)}" placeholder="+34..."
                            onchange="mergeTool.pending.data.tels[${i}] = PhoneUtils.normalize(this.value)">
                        <button class="btn btn-danger" onclick="mergeTool.removeItem('tels', ${i})">×</button>
                    </div>
                `).join('')}
            </div>

            <div class="input-group">
                <div class="input-header">
                    <span class="input-label">Emails (${data.emails.length})</span>
                    <button class="btn btn-outline btn-sm" onclick="mergeTool.addField('emails')">+ Anadir</button>
                </div>
                ${data.emails.map((email, i) => `
                    <div class="item-row">
                        <input class="input-field" value="${email}" placeholder="email@..."
                            onchange="mergeTool.pending.data.emails[${i}] = this.value">
                        <button class="btn btn-danger" onclick="mergeTool.removeItem('emails', ${i})">×</button>
                    </div>
                `).join('')}
            </div>

            ${textInput('Organizacion', 'org', data.org || '')}
        `;

        // Optional fields (only show if defined)
        if (data.title !== undefined) html += textInput('Cargo / Titulo', 'title', data.title);
        if (data.adr !== undefined) html += textInput('Direccion', 'adr', data.adr);
        if (data.url !== undefined) html += textInput('Sitio Web', 'url', data.url);
        if (data.bday !== undefined) html += textInput('Cumpleanos (YYYY-MM-DD)', 'bday', data.bday);
        if (data.note !== undefined) html += textInput('Notas', 'note', data.note);

        container.innerHTML = html;
    }

    /**
     * Add an empty field to an array property
     * @param {string} type - Field type ('tels' or 'emails')
     */
    addField(type) {
        this.pending.data[type].push('');
        this.renderResultForm();
    }

    /**
     * Add a custom field based on selector value
     */
    addCustomField() {
        const selector = document.getElementById('addFieldSelector');
        if (!selector) return;

        const type = selector.value;
        if (this.pending.data[type] === undefined) {
            this.pending.data[type] = '';
        }
        this.renderResultForm();
    }

    /**
     * Remove an item from an array field
     * @param {string} key - Field key
     * @param {number} index - Item index
     */
    removeItem(key, index) {
        this.pending.data[key].splice(index, 1);
        this.renderResultForm();
    }

    /**
     * Commit the merge and update contacts
     */
    commit() {
        const pending = this.pending;

        // Create merged contact
        const newContact = {
            _id: pending.targetId,
            fn: pending.data.fn,
            tels: pending.data.tels.filter(t => t.length > 0),
            emails: pending.data.emails.filter(e => e.length > 0),
            org: pending.data.org,
            title: pending.data.title,
            adr: pending.data.adr,
            url: pending.data.url,
            bday: pending.data.bday,
            note: pending.data.note
        };

        // Remove old contacts and add merged one
        core.contacts = core.contacts.filter(c => !pending.idsToRemove.includes(c._id));
        core.contacts.unshift(newContact);

        this.close(true);
        core.deselectAll();

        // Continue auto-merge if active
        if (autoMerger.active) {
            setTimeout(() => autoMerger.processNext(), 200);
        }
    }

    /**
     * Close the merge modal
     * @param {boolean} isSuccess - Whether merge was successful
     */
    close(isSuccess = false) {
        const modal = document.getElementById('mergeModal');
        if (modal) modal.style.display = 'none';
        
        this.pending = null;

        // Cancel auto-merge if closing without success
        if (autoMerger.active && !isSuccess) {
            autoMerger.cancel();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MergeTool;
}
