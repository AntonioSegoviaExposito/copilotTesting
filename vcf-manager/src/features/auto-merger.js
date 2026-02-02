/**
 * VCF Manager - Auto Merger Module
 * 
 * PURPOSE: Automatic duplicate contact detection and queue-based merging
 * DEPENDENCIES: ContactManager (core), PhoneUtils, MergeTool, Config
 * USED BY: app.js (creates global instance)
 * 
 * This module handles:
 * - Finding duplicate contacts by name or phone number
 * - Managing a queue of duplicate groups to merge
 * - Presenting each group to user for merge decisions
 * - Processing queue sequentially until complete
 * 
 * DUPLICATE DETECTION ALGORITHMS:
 * 1. BY NAME: Groups contacts with identical normalized names (case-insensitive, trimmed)
 * 2. BY PHONE: Groups contacts sharing at least one normalized phone number
 * 
 * QUEUE WORKFLOW:
 * 1. start() - Detect duplicates and populate queue
 * 2. processNext() - Show first group in merge tool
 * 3. User merges contacts (via MergeTool)
 * 4. processNext() called again → next group shown
 * 5. Repeat until queue empty → show completion message
 * 
 * STATE MANAGEMENT:
 * - queue: Array of arrays [[id1, id2], [id3, id4, id5], ...]
 * - active: Boolean flag indicating if auto-merge is in progress
 * 
 * AI MAINTENANCE NOTES:
 * - Phone-based detection handles contacts with multiple shared numbers
 * - Groups are deduplicated to avoid processing same contacts multiple times
 * - Queue is filtered in processNext() to handle contacts deleted during merge
 * - UI elements (queueToast, autoMergeHint) provide user feedback
 * - To add new detection mode, implement _findDuplicatesBy*() method
 */

/**
 * Auto Merger Class
 * Manages automatic duplicate detection and sequential merge queue processing
 */
class AutoMerger {
    /**
     * Initialize AutoMerger with empty queue
     * 
     * STATE:
     * - queue: Empty array, will be populated by start()
     * - active: False until start() is called
     */
    constructor() {
        this.queue = [];
        this.active = false;
    }

    /**
     * Start auto-merge process with specified detection mode
     * 
     * WORKFLOW:
     * 1. Validate contacts exist
     * 2. Find duplicates using selected algorithm
     * 3. Build queue of duplicate groups
     * 4. Start processing queue
     * 
     * @param {string} mode - Detection mode: 'name' or 'phone'
     *   - 'name': Groups by exact name match (case-insensitive)
     *   - 'phone': Groups by shared phone numbers
     * 
     * @returns {void} Shows alert if no contacts or no duplicates found
     * 
     * @example
     * // Find duplicates by name
     * autoMerger.start('name');
     * 
     * @example
     * // Find duplicates by phone number
     * autoMerger.start('phone');
     */
    start(mode) {
        // Guard: Ensure contacts exist before processing
        if (core.contacts.length === 0) {
            return alert(Config.messages.emptyAgenda);
        }

        // Run appropriate duplicate detection algorithm
        const groups = mode === 'name' 
            ? this._findDuplicatesByName() 
            : this._findDuplicatesByPhone();

        // Initialize queue with found groups
        this.queue = groups;

        // Guard: Stop if no duplicates found
        if (this.queue.length === 0) {
            return alert(Config.messages.noDuplicates);
        }

        // Begin queue processing
        this.active = true;
        this.processNext();
    }

    /**
     * Find duplicate contacts by name (exact match algorithm)
     * 
     * ALGORITHM:
     * 1. Normalize each contact name: lowercase + trim whitespace
     * 2. Group contacts by normalized name (use name as key)
     * 3. Filter out groups with only 1 contact
     * 4. Return array of contact ID groups
     * 
     * EDGE CASES:
     * - Empty names (length 0) are ignored
     * - "John Doe" and "john doe" are considered duplicates
     * - "Jane " and "Jane" are considered duplicates (trim)
     * 
     * @private
     * @returns {Array<Array<string>>} Array of contact ID groups, e.g. [['id1', 'id2'], ['id3', 'id4', 'id5']]
     * 
     * @example
     * // Given contacts: [
     * //   {_id: '1', fn: 'John Doe'},
     * //   {_id: '2', fn: 'john doe'},
     * //   {_id: '3', fn: 'Jane Smith'}
     * // ]
     * // Returns: [['1', '2']]
     */
    _findDuplicatesByName() {
        const groups = {};

        // Step 1-2: Group contacts by normalized name
        core.contacts.forEach(contact => {
            // Normalize: convert to lowercase and trim whitespace
            const key = contact.fn.toLowerCase().trim();
            
            // Skip empty names (no valid grouping key)
            if (key.length > 0) {
                // Initialize group array if first occurrence
                if (!groups[key]) groups[key] = [];
                
                // Add contact ID to this name's group
                groups[key].push(contact._id);
            }
        });

        // Step 3-4: Return only groups with 2+ contacts
        return Object.values(groups).filter(g => g.length > 1);
    }

    /**
     * Find duplicate contacts by phone number (shared number algorithm)
     * 
     * ALGORITHM:
     * 1. Build phone → [contactIDs] map using normalized phone numbers
     * 2. For each phone with 2+ contacts, create a group
     * 3. Deduplicate groups (same contacts may share multiple phones)
     * 4. Return unique groups
     * 
     * DEDUPLICATION LOGIC:
     * - Contact A and B share two phones → one group, not two
     * - Uses Set to track unique groups
     * - Sorts IDs before stringifying to ensure ['1','2'] === ['2','1']
     * 
     * EDGE CASES:
     * - Empty/invalid phone numbers are ignored (normalize returns '')
     * - Contact with no valid phones won't be in any group
     * - Group [A,B,C] and [B,C,A] are treated as same group
     * 
     * @private
     * @returns {Array<Array<string>>} Array of unique contact ID groups
     * 
     * @example
     * // Given contacts:
     * // Contact 1: phones ['+34612111111', '+34612222222']
     * // Contact 2: phones ['+34612111111']
     * // Contact 3: phones ['+34612222222']
     * // Result: One group ['1', '2', '3'] (all share phones)
     */
    _findDuplicatesByPhone() {
        const phoneMap = {};

        // Step 1: Build phone → [contactIDs] mapping
        core.contacts.forEach(contact => {
            // Each contact may have multiple phone numbers
            contact.tels.forEach(tel => {
                // Normalize phone to ensure consistent comparison
                const normalized = PhoneUtils.normalize(tel);
                
                // Skip invalid/empty phone numbers
                if (normalized) {
                    // Initialize array for this phone number if first occurrence
                    if (!phoneMap[normalized]) phoneMap[normalized] = [];
                    
                    // Add this contact ID to the phone's contact list
                    phoneMap[normalized].push(contact._id);
                }
            });
        });

        // Step 2-3: Extract groups and deduplicate
        const uniqueGroups = new Set();
        
        Object.values(phoneMap).forEach(ids => {
            // Remove duplicate IDs (same contact added multiple times for same phone)
            const unique = [...new Set(ids)];
            
            // Only keep groups with 2+ different contacts
            if (unique.length > 1) {
                // Sort IDs to ensure consistent serialization for deduplication
                // This makes [1,2,3] and [3,1,2] produce the same string
                uniqueGroups.add(JSON.stringify(unique.sort()));
            }
        });

        // Step 4: Convert Set back to array of ID arrays
        return Array.from(uniqueGroups).map(json => JSON.parse(json));
    }

    /**
     * Process the next group in the queue
     * 
     * QUEUE PROCESSING WORKFLOW:
     * 1. Loop through queue until finding valid group or queue empty
     * 2. For each group:
     *    a. Resolve contact IDs to actual contact objects
     *    b. Filter out deleted/invalid contacts
     *    c. Skip if less than 2 valid contacts remain
     *    d. Show valid group in merge tool and exit
     * 3. If queue exhausted, show completion message
     * 
     * VALIDATION LOGIC:
     * - Contact may have been deleted in previous merge
     * - findById returns null for deleted contacts
     * - Group needs 2+ valid contacts to be mergeable
     * 
     * CALLED BY:
     * - start() - Initial call after queue populated
     * - MergeTool - After user completes a merge
     * 
     * @returns {void} Either shows next group or completion alert
     * 
     * @example
     * // Queue has 3 groups: [['1','2'], ['3','4'], ['5','6']]
     * // Call 1: Shows group ['1','2']
     * // (user merges in MergeTool)
     * // Call 2: Shows group ['3','4']
     * // (user merges in MergeTool)
     * // Call 3: Shows group ['5','6']
     * // (user merges in MergeTool)
     * // Call 4: Shows completion alert
     */
    processNext() {
        // Process queue until valid group found or queue empty
        while (this.queue.length > 0) {
            // Get first group from queue (array of contact IDs)
            const nextGroupIds = this.queue[0];
            
            // Resolve IDs to actual contact objects
            // Filter out null (deleted contacts)
            const validContacts = nextGroupIds
                .map(id => core.findById(id))
                .filter(c => c);

            // Skip invalid groups (contacts deleted during previous merges)
            if (validContacts.length < 2) {
                // Remove this invalid group and continue to next
                this.queue.shift();
                continue;
            }

            // Valid group found - show it to user
            this._showGroup(validContacts);
            
            // Remove this group from queue (will be processed by user)
            this.queue.shift();
            
            // Exit - wait for MergeTool to call processNext() again
            return;
        }

        // Queue is now empty - auto-merge complete
        this.active = false;
        this._hideUI();
        alert(Config.messages.autoMergeComplete);
    }

    /**
     * Show a group of duplicate contacts in the merge tool
     * 
     * PREPARATION STEPS:
     * 1. Update queue progress indicator (toast)
     * 2. Show auto-merge hint to user
     * 3. Sort contacts by name length (heuristic: longer = more complete)
     * 4. Select all contacts in the group
     * 5. Open merge tool with selected contacts
     * 
     * SORTING HEURISTIC:
     * - Longer name often means more complete/detailed contact
     * - First contact (longest name) becomes merge target by default
     * - Example: "John Michael Doe" before "John Doe"
     * 
     * SELECTION STATE:
     * - Clears any previous selection
     * - Adds all group contacts to core.selected Set
     * - Maintains order in core.selectOrder array
     * - MergeTool reads this selection state
     * 
     * @private
     * @param {Array<Contact>} contacts - Array of 2+ contact objects to merge
     * @returns {void}
     */
    _showGroup(contacts) {
        // Step 1: Update queue progress toast
        const toast = document.getElementById('queueToast');
        if (toast) {
            // Show remaining count (including current group)
            toast.innerText = `Cola: ${this.queue.length + 1} grupos restantes`;
            toast.style.display = 'block';
        }

        // Step 2: Show hint to guide user
        const hint = document.getElementById('autoMergeHint');
        if (hint) hint.style.display = 'block';

        // Step 3: Sort by name length (descending)
        // Heuristic: Longer names are usually more complete
        // This helps pre-select the best merge target
        contacts.sort((a, b) => b.fn.length - a.fn.length);

        // Step 4: Select contacts in the group
        // Clear any previous selection
        core.selected.clear();
        core.selectOrder = [];
        
        // Add all contacts from group to selection
        contacts.forEach(c => {
            core.selected.add(c._id);
            core.selectOrder.push(c._id);
        });

        // Step 5: Open merge tool with selected contacts
        mergeTool.init();
    }

    /**
     * Hide auto-merge UI elements
     * 
     * Called when auto-merge process ends (complete or cancelled)
     * Hides progress indicators to return to normal UI state
     * 
     * @private
     * @returns {void}
     */
    _hideUI() {
        const toast = document.getElementById('queueToast');
        const hint = document.getElementById('autoMergeHint');
        
        if (toast) toast.style.display = 'none';
        if (hint) hint.style.display = 'none';
    }

    /**
     * Cancel the auto-merge process
     * 
     * Stops processing queue and returns to normal state
     * User can call this to exit auto-merge early
     * 
     * CALLED BY:
     * - User clicking "Cancel" button during auto-merge
     * - Keyboard shortcut (if implemented)
     * 
     * @returns {void} Shows cancellation confirmation alert
     * 
     * @example
     * // User starts auto-merge with 10 groups
     * // After processing 3 groups, user clicks Cancel
     * autoMerger.cancel();
     * // Queue is cleared, remaining 7 groups not processed
     */
    cancel() {
        // Mark as inactive (stops processing)
        this.active = false;
        
        // Hide progress UI elements
        this._hideUI();
        
        // Notify user of cancellation
        alert(Config.messages.autoMergeCancelled);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoMerger;
}
