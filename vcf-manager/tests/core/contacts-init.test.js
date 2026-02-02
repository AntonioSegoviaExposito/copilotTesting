/**
 * ContactManager Init Tests
 * Tests for initialization and file input binding
 */

describe('ContactManager - Init', () => {
    let contactManager;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <input type="file" id="fileInput" accept=".vcf">
            <div id="grid" class="grid"></div>
            <div id="statDisplay">0 contacts</div>
            <button id="btnExport">Export (0)</button>
            <div id="fab" class="fab">
                <span id="selCount">0</span>
                <span id="fabActionText">MERGE</span>
            </div>
        `;

        contactManager = new ContactManager();
        jest.clearAllMocks();
    });

    describe('init', () => {
        test('should bind file input change event', () => {
            const fileInput = document.getElementById('fileInput');
            
            // Spy on addEventListener to verify it's called
            const addEventListenerSpy = jest.spyOn(fileInput, 'addEventListener');
            
            // Call init to bind the event
            contactManager.init();
            
            // Verify addEventListener was called with 'change'
            expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
            
            // Clean up
            addEventListenerSpy.mockRestore();
        });

        test('should handle missing fileInput element gracefully', () => {
            // Remove the file input element
            document.getElementById('fileInput').remove();
            
            // Should not throw an error
            expect(() => contactManager.init()).not.toThrow();
        });
    });
});