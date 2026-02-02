/**
 * VCF Manager - Merge Tool Module
 * 
 * PURPOSE: Interactive contact merging and editing UI with master/slave pattern
 * DEPENDENCIES: ContactManager (core), PhoneUtils, AutoMerger (optional)
 * USED BY: app.js (creates global instance), AutoMerger (for queue processing)
 * 
 * This module handles:
 * - Building merged contact data from multiple sources
 * - Managing master/slave pattern (first selected = master)
 * - Rendering interactive merge modal UI
 * - Field editing and customization before commit
 * - Integrating with auto-merge queue workflow
 * 
 * MASTER/SLAVE PATTERN:
 * - First contact in selection = MASTER (target for merge)
 * - Other contacts = SLAVES (will be deleted after merge)
 * - Master contact data takes priority in merge
 * - User can swap master by clicking slave contact
 * 
 * DATA COMBINATION LOGIC:
 * - Phone numbers: Combined from all contacts, normalized, deduplicated
 * - Emails: Combined from all contacts, deduplicated
 * - Text fields (org, title, adr, etc.): Master value prioritized, fallback to first slave with value
 * - Result stored in pending.data for editing before commit
 * 
 * UI WORKFLOW:
 * 1. init() - Build pending data from selection, render modal
 * 2. User edits fields in form (changes pending.data directly)
 * 3. User can swap master (rebuilds pending, re-renders)
 * 4. commit() - Apply merge, delete slaves, update UI
 * 5. close() - Hide modal, clear state
 * 
 * AUTO-MERGE INTEGRATION:
 * - If autoMerger.active = true, commit() calls autoMerger.processNext()
 * - If close() without success, calls autoMerger.cancel()
 * - Enables queue-based bulk merging workflow
 * 
 * AI MAINTENANCE NOTES:
 * - pending structure holds all temporary merge state
 * - renderResultForm() uses inline event handlers (oninput, onchange)
 * - Phone numbers are normalized on storage, formatted on display
 * - Optional fields only shown if at least one source has value
 * - To add new field type, update buildPending() and renderResultForm()
 */

/**
 * @typedef {Object} PendingMerge
 * @property {string} targetId - ID of master contact (merge target)
 * @property {string[]} idsToRemove - Array of all contact IDs to remove (master + slaves)
 * @property {Object} data - Merged contact data (editable before commit)
 * @property {string} data.fn - Full name
 * @property {string[]} data.tels - Phone numbers (normalized)
 * @property {string[]} data.emails - Email addresses
 * @property {string} data.org - Organization name
 * @property {string} [data.title] - Job title (optional)
 * @property {string} [data.adr] - Address (optional)
 * @property {string} [data.note] - Notes (optional)
 * @property {string} [data.url] - Website URL (optional)
 * @property {string} [data.bday] - Birthday in YYYY-MM-DD format (optional)
 * @property {Contact[]} originalObjects - Array of source contacts [master, ...slaves]
 */

/**
 * Merge Tool Class
 * Handles interactive contact merging with master/slave pattern and editable form
 */
class MergeTool {
    /**
     * Initialize MergeTool with empty state
     * 
     * INITIAL STATE:
     * - No pending merge operation
     * - Modal hidden
     */
    constructor() {
        /** @type {PendingMerge|null} Current pending merge operation (null when idle) */
        this.pending = null;
    }

    /**
     * Initialize merge tool with selected contacts
     * 
     * INITIALIZATION WORKFLOW:
     * 1. Validate at least one contact selected
     * 2. Build pending merge data from selection
     * 3. Render modal UI
     * 
     * SELECTION ORDER MATTERS:
     * - First in core.selectOrder becomes master
     * - Rest become slaves
     * - Order preserved from user's selection sequence
     * 
     * CALLED BY:
     * - User clicking FAB button (from app.js)
     * - AutoMerger._showGroup() during queue processing
     * 
     * @returns {void} Does nothing if no contacts selected
     * 
     * @example
     * // User selects 3 contacts, clicks merge button
     * core.selectOrder = ['id1', 'id2', 'id3'];
     * mergeTool.init(); // id1 = master, id2-id3 = slaves
     */
    init() {
        // Guard: Require at least one contact selected
        if (core.selectOrder.length < 1) return;
        
        // Build merge data from selection order
        this.buildPending(core.selectOrder);
        
        // Show modal with merge UI
        this.renderUI();
    }

    /**
     * Swap the master contact (change merge target)
     * 
     * MASTER SWAPPING LOGIC:
     * 1. Validate new master is different from current
     * 2. Reorder IDs: newMaster first, then others (preserving order)
     * 3. Rebuild pending merge with new master
     * 4. Re-render UI to reflect change
     * 
     * WHY REBUILD:
     * - Master data takes priority in field combination
     * - Changing master changes final merged values
     * - Example: If Master A has org="CompanyA" and Slave B has org="CompanyB",
     *   swapping B to master will make org="CompanyB" in result
     * 
     * USER INTERACTION:
     * - User clicks on a SLAVE contact card in sources list
     * - That slave becomes new MASTER
     * - Old master becomes a slave
     * 
     * @param {string} newMasterId - ID of contact to promote to master
     * @returns {void} Does nothing if newMasterId is already master
     * 
     * @example
     * // Current: master='id1', slaves=['id2','id3']
     * mergeTool.swapMaster('id2');
     * // Result: master='id2', slaves=['id1','id3']
     */
    swapMaster(newMasterId) {
        // Guard: Skip if already master (no-op)
        if (newMasterId === this.pending.targetId) return;

        // Reorder IDs array: new master first, then others
        const oldOrder = this.pending.idsToRemove;
        const newOrder = [newMasterId, ...oldOrder.filter(id => id !== newMasterId)];
        
        // Rebuild merge data with new master priority
        this.buildPending(newOrder);
        
        // Update UI to show new master/slave layout
        this.renderUI();
    }

    /**
     * Build pending merge data from contact IDs
     * 
     * FIELD COMBINATION ALGORITHM:
     * 
     * PHONE NUMBERS (tels):
     * 1. Collect all phones from master and slaves
     * 2. Normalize each phone (consistent format)
     * 3. Use Set to deduplicate (same phone from multiple contacts)
     * 4. Convert back to array for storage
     * 
     * EMAILS:
     * 1. Collect all emails from master and slaves
     * 2. Use Set to deduplicate (case-sensitive)
     * 3. Convert back to array for storage
     * 
     * TEXT FIELDS (org, title, adr, note, url, bday):
     * 1. Use master value if present
     * 2. If master empty, find first slave with value
     * 3. Use optional chaining (?.) to handle undefined safely
     * 4. Fields remain undefined if no source has value
     * 
     * PRIORITY HIERARCHY:
     * Master value > First slave with value > undefined/empty
     * 
     * EDGE CASES:
     * - Invalid contact IDs filtered out (map → filter)
     * - Empty strings ("") treated as valid values (not replaced)
     * - Only undefined/null triggers fallback to slaves
     * - Normalized phones may deduplicate different formats of same number
     * 
     * @param {string[]} ids - Array of contact IDs (first = master, rest = slaves)
     * @returns {void} Populates this.pending with merge data
     * 
     * @example
     * // Master: {fn: "John Doe", tels: ["+34612111111"], org: "CompanyA"}
     * // Slave1: {fn: "John D", tels: ["+34612111111", "+34612222222"], org: ""}
     * // Slave2: {fn: "J Doe", tels: ["+34612333333"], title: "Manager"}
     * // Result:
     * // {
     * //   fn: "John Doe",              // master value
     * //   tels: ["+34612111111", "+34612222222", "+34612333333"], // combined, deduplicated
     * //   org: "CompanyA",             // master value
     * //   title: "Manager"             // first slave with value (Slave2)
     * // }
     */
    buildPending(ids) {
        // Identify master (first ID) and resolve to contact object
        const masterId = ids[0];
        const masterContact = core.findById(masterId);
        
        // Resolve slave IDs to contact objects, filter out invalid IDs
        const slaves = ids.slice(1)
            .map(id => core.findById(id))
            .filter(x => x); // Remove null/undefined (deleted contacts)

        // === COMBINE PHONE NUMBERS ===
        // Use Set for automatic deduplication
        const combinedTels = new Set();
        
        // Add master phones (normalized)
        masterContact.tels.forEach(t => combinedTels.add(PhoneUtils.normalize(t)));
        
        // Add slave phones (normalized)
        slaves.forEach(s => s.tels.forEach(t => combinedTels.add(PhoneUtils.normalize(t))));

        // === COMBINE EMAILS ===
        // Use Set for automatic deduplication
        const combinedEmails = new Set(masterContact.emails);
        
        // Add slave emails
        slaves.forEach(s => s.emails.forEach(e => combinedEmails.add(e)));

        // === BUILD PENDING STRUCTURE ===
        // Master fields take priority, fallback to first slave with value
        this.pending = {
            targetId: masterId,
            idsToRemove: ids, // All IDs (master + slaves) to be removed after merge
            data: {
                fn: masterContact.fn, // Name always comes from master
                tels: Array.from(combinedTels), // Combined and deduplicated
                emails: Array.from(combinedEmails), // Combined and deduplicated
                org: masterContact.org || slaves.find(s => s.org)?.org || '', // Fallback chain
                title: masterContact.title || slaves.find(s => s.title)?.title || undefined,
                adr: masterContact.adr || slaves.find(s => s.adr)?.adr || undefined,
                note: masterContact.note || slaves.find(s => s.note)?.note || undefined,
                url: masterContact.url || slaves.find(s => s.url)?.url || undefined,
                bday: masterContact.bday || slaves.find(s => s.bday)?.bday || undefined
            },
            originalObjects: [masterContact, ...slaves] // Keep references for display
        };
    }

    /**
     * Render the merge modal UI
     * 
     * MODAL SETUP:
     * 1. Show modal (set display='flex' for flex centering)
     * 2. Update modal title based on operation type
     * 3. Render source contacts list (master/slave cards)
     * 4. Render editable result form
     * 
     * TITLE LOGIC:
     * - Single contact (no slaves): "Edicion" (Edit mode)
     * - Multiple contacts: "Fusion (N)" where N = total count
     * - Example: "Fusion (3)" for 1 master + 2 slaves
     * 
     * TWO-PANEL LAYOUT:
     * - Left panel (#mergeSourcesList): Shows master/slave contacts
     * - Right panel (#mergeResultForm): Shows editable merged result
     * 
     * @returns {void}
     * 
     * @example
     * // After buildPending() with 3 contacts:
     * // Modal shows "Fusion (3)"
     * // Left: MASTER + 2 SLAVE cards
     * // Right: Editable form with combined data
     */
    renderUI() {
        // Show modal container
        const modal = document.getElementById('mergeModal');
        if (modal) modal.style.display = 'flex';

        // Calculate slave count for title
        const slavesCount = this.pending.originalObjects.length - 1;
        
        // Update modal title based on operation type
        const title = document.getElementById('modalTitle');
        if (title) {
            // Single contact = edit mode, multiple = merge mode
            title.innerText = slavesCount > 0 ? `Fusion (${slavesCount + 1})` : "Edicion";
        }

        // Render both panels
        this._renderSourcesList();
        this.renderResultForm();
    }

    /**
     * Render the sources list (master/slave contacts)
     * 
     * DISPLAY LOGIC:
     * - First contact (index 0) = MASTER
     * - Other contacts = SLAVES
     * - Each contact shown as card with name and phones
     * 
     * MASTER CARD:
     * - Green badge "MASTER"
     * - Primary color accent
     * - Not clickable (already master)
     * - No hover hint
     * 
     * SLAVE CARDS:
     * - Gray badge "SLAVE"
     * - Gray color accent
     * - Clickable to swap to master
     * - Shows "👈 Convertir en Master" hint on hover
     * - Onclick calls swapMaster(contactId)
     * 
     * CARD CONTENT:
     * - Badge: "MASTER" or "SLAVE" label
     * - Name: Full contact name (bold, large)
     * - Phones: All phone numbers (smaller, gray)
     * 
     * UI PATTERN:
     * - Visual hierarchy: Master stands out (primary color)
     * - Affordance: Slaves show clickability on hover
     * - Feedback: Clear labels indicate role
     * 
     * @private
     * @returns {void}
     */
    _renderSourcesList() {
        const list = document.getElementById('mergeSourcesList');
        if (!list) return;

        // Clear existing content
        list.innerHTML = '';

        // Render each source contact (master first, then slaves)
        this.pending.originalObjects.forEach((contact, index) => {
            // First contact is always master
            const isMaster = index === 0;
            
            // Only slaves are clickable (to become master)
            const onclick = isMaster ? '' : `onclick="mergeTool.swapMaster('${contact._id}')"`;

            // Build contact card HTML
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
     * 
     * FORM STRUCTURE:
     * 1. Always visible fields: fn, tels, emails, org
     * 2. Optional fields: Only shown if at least one source has value
     * 3. Each field group has header with label and action buttons
     * 
     * FIELD TYPES:
     * 
     * TEXT INPUT (fn, org, title, adr, url, bday, note):
     * - Single input with oninput handler
     * - Updates pending.data directly via inline JS
     * - Example: oninput="mergeTool.pending.data.fn = this.value"
     * 
     * ARRAY FIELDS (tels, emails):
     * - Multiple inputs (one per item)
     * - Shows count in header: "Telefonos (3)"
     * - "+" button to add new empty item
     * - "×" button on each item to remove
     * - Phone inputs use onchange (normalize on blur)
     * - Email inputs use onchange (immediate update)
     * 
     * INLINE EVENT HANDLERS:
     * - Direct DOM manipulation for simplicity
     * - No need for event delegation or framework
     * - Changes immediately reflected in pending.data
     * - Works well with string-based HTML generation
     * 
     * PHONE NUMBER HANDLING:
     * - Display: Formatted with PhoneUtils.format() for readability
     * - Storage: Normalized with PhoneUtils.normalize() on change
     * - Placeholder: "+34..." hints at international format
     * 
     * OPTIONAL FIELD LOGIC:
     * - Only added to HTML if data[field] !== undefined
     * - Example: title only shown if master or slave had title
     * - Reduces clutter for unused fields
     * - User can add missing fields via "Add Field" selector
     * 
     * @returns {void}
     * 
     * @example
     * // Pending data with 2 phones, 1 email:
     * // Renders:
     * // - "Nombre Completo" input
     * // - "Telefonos (2)" header + 2 inputs + remove buttons
     * // - "Emails (1)" header + 1 input + remove button
     * // - "Organizacion" input
     * // - Optional fields if present
     */
    renderResultForm() {
        const container = document.getElementById('mergeResultForm');
        if (!container) return;

        const data = this.pending.data;

        // Helper function to create text input field HTML
        // Returns a div.input-group with label and input
        const textInput = (label, key, value) => `
            <div class="input-group">
                <div class="input-header"><span class="input-label">${label}</span></div>
                <input class="input-field" value="${value}" oninput="mergeTool.pending.data.${key} = this.value">
            </div>
        `;

        // === BUILD FORM HTML ===
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

        // === OPTIONAL FIELDS ===
        // Only show if at least one source contact has value
        // This prevents clutter from unused fields
        if (data.title !== undefined) html += textInput('Cargo / Titulo', 'title', data.title);
        if (data.adr !== undefined) html += textInput('Direccion', 'adr', data.adr);
        if (data.url !== undefined) html += textInput('Sitio Web', 'url', data.url);
        if (data.bday !== undefined) html += textInput('Cumpleanos (YYYY-MM-DD)', 'bday', data.bday);
        if (data.note !== undefined) html += textInput('Notas', 'note', data.note);

        // Inject HTML into container
        container.innerHTML = html;
    }

    /**
     * Add an empty field to an array property
     * 
     * USAGE:
     * - User clicks "+ Anadir" button in tels or emails section
     * - Adds empty string to array
     * - Re-renders form to show new input field
     * - User can then type value into new input
     * 
     * SUPPORTED TYPES:
     * - 'tels': Phone numbers array
     * - 'emails': Email addresses array
     * 
     * @param {string} type - Field type ('tels' or 'emails')
     * @returns {void}
     * 
     * @example
     * // User has 2 phone numbers, clicks "+ Anadir"
     * mergeTool.addField('tels');
     * // Result: pending.data.tels = [...existing, '']
     * // Form re-renders with 3 phone inputs (last one empty)
     */
    addField(type) {
        // Add empty string to array
        this.pending.data[type].push('');
        
        // Re-render to show new input field
        this.renderResultForm();
    }

    /**
     * Add a custom optional field based on selector value
     * 
     * USAGE:
     * - User selects field type from dropdown (e.g., "title", "url")
     * - Clicks "Add Field" button
     * - If field doesn't exist (undefined), initializes as empty string
     * - Form re-renders to show new field input
     * 
     * FIELD INITIALIZATION:
     * - Sets field to empty string if currently undefined
     * - If field already exists, does nothing (no duplicate)
     * - Re-render handles showing the field in UI
     * 
     * SUPPORTED CUSTOM FIELDS:
     * - title: Job title
     * - adr: Address
     * - url: Website URL
     * - bday: Birthday
     * - note: Notes
     * 
     * @returns {void}
     * 
     * @example
     * // User wants to add website field
     * // 1. Select "url" from dropdown
     * // 2. Click "Add Field" button
     * // 3. pending.data.url = ''
     * // 4. Form re-renders showing "Sitio Web" input
     */
    addCustomField() {
        const selector = document.getElementById('addFieldSelector');
        if (!selector) return;

        const type = selector.value;
        
        // Initialize field as empty string if not present
        if (this.pending.data[type] === undefined) {
            this.pending.data[type] = '';
        }
        
        // Re-render to show new field
        this.renderResultForm();
    }

    /**
     * Remove an item from an array field
     * 
     * USAGE:
     * - User clicks "×" button next to phone or email
     * - Removes item at specified index from array
     * - Re-renders form to update display
     * 
     * ARRAY MODIFICATION:
     * - Uses splice() to remove item by index
     * - Modifies array in-place (mutates pending.data)
     * - Other items shift to fill gap (index-based)
     * 
     * SUPPORTED FIELDS:
     * - 'tels': Phone numbers array
     * - 'emails': Email addresses array
     * 
     * @param {string} key - Field key ('tels' or 'emails')
     * @param {number} index - Array index to remove (0-based)
     * @returns {void}
     * 
     * @example
     * // pending.data.tels = ['+34612111111', '+34612222222', '+34612333333']
     * mergeTool.removeItem('tels', 1);
     * // Result: ['+34612111111', '+34612333333']
     * // Middle item removed
     */
    removeItem(key, index) {
        // Remove 1 item at specified index
        this.pending.data[key].splice(index, 1);
        
        // Re-render to update display
        this.renderResultForm();
    }

    /**
     * Commit the merge and update contacts
     * 
     * COMMIT WORKFLOW:
     * 1. Build final contact object from pending.data
     * 2. Filter empty values from arrays (tels, emails)
     * 3. Remove all source contacts (master + slaves) from core
     * 4. Add merged contact to beginning of list (most recent)
     * 5. Close modal and clear selection
     * 6. If auto-merge active, process next group
     * 
     * DATA CLEANUP:
     * - Filters out empty strings from tels and emails
     * - Preserves all other fields as-is (including empty strings)
     * - Example: tels=['', '+34612...', ''] → ['+34612...']
     * 
     * CONTACT REMOVAL:
     * - Removes ALL contacts in idsToRemove (master + slaves)
     * - Uses filter to exclude by ID
     * - This is key to merge: remove old, add new
     * 
     * CONTACT INSERTION:
     * - Uses unshift() to add at beginning of array
     * - Makes merged contact appear first in list
     * - Preserves creation order for other contacts
     * 
     * AUTO-MERGE INTEGRATION:
     * - Checks if autoMerger.active flag is true
     * - If yes, calls processNext() after short delay
     * - Delay (200ms) allows UI to update smoothly
     * - Continues queue processing automatically
     * 
     * @returns {void}
     * 
     * @example
     * // Before commit:
     * // core.contacts = [Master, Slave1, Slave2, Other1, Other2]
     * // After commit:
     * // core.contacts = [Merged, Other1, Other2]
     */
    commit() {
        const pending = this.pending;

        // === BUILD MERGED CONTACT ===
        // Create new contact object with merged data
        const newContact = {
            _id: pending.targetId, // Keep master's ID
            fn: pending.data.fn,
            tels: pending.data.tels.filter(t => t.length > 0), // Remove empty strings
            emails: pending.data.emails.filter(e => e.length > 0), // Remove empty strings
            org: pending.data.org,
            title: pending.data.title,
            adr: pending.data.adr,
            url: pending.data.url,
            bday: pending.data.bday,
            note: pending.data.note
        };

        // === UPDATE CONTACT LIST ===
        // Remove old contacts (master + slaves)
        core.contacts = core.contacts.filter(c => !pending.idsToRemove.includes(c._id));
        
        // Add merged contact at beginning (most recent position)
        core.contacts.unshift(newContact);

        // === CLEANUP UI STATE ===
        // Close modal and clear selection
        this.close(true);
        core.deselectAll();

        // === AUTO-MERGE CONTINUATION ===
        // If auto-merge is running, process next group in queue
        if (autoMerger.active) {
            // Small delay for smooth UI transition
            setTimeout(() => autoMerger.processNext(), 200);
        }
    }

    /**
     * Close the merge modal
     * 
     * CLOSE WORKFLOW:
     * 1. Hide modal (set display='none')
     * 2. Clear pending merge state
     * 3. If closing without success during auto-merge, cancel queue
     * 
     * SUCCESS PARAMETER:
     * - isSuccess=true: User committed merge (normal completion)
     * - isSuccess=false: User cancelled or closed modal
     * 
     * AUTO-MERGE CANCELLATION:
     * - If auto-merge active AND closing without success
     * - Calls autoMerger.cancel() to stop queue processing
     * - Prevents showing next group when user cancelled
     * 
     * CALLED BY:
     * - commit() with isSuccess=true after merge complete
     * - User clicking "Cancel" button (isSuccess=false)
     * - User clicking modal backdrop (isSuccess=false)
     * - ESC key handler (isSuccess=false)
     * 
     * @param {boolean} [isSuccess=false] - Whether merge was successfully committed
     * @returns {void}
     * 
     * @example
     * // User clicks "Fusionar" button:
     * mergeTool.commit();           // Calls close(true) internally
     * 
     * // User clicks "Cancel" button:
     * mergeTool.close();            // close(false) → cancels auto-merge
     */
    close(isSuccess = false) {
        // Hide modal UI
        const modal = document.getElementById('mergeModal');
        if (modal) modal.style.display = 'none';
        
        // Clear pending merge state
        this.pending = null;

        // Cancel auto-merge if closing without success
        // This handles user cancelling during queue processing
        if (autoMerger.active && !isSuccess) {
            autoMerger.cancel();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MergeTool;
}
