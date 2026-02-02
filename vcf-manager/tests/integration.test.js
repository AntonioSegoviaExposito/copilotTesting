/**
 * Integration Tests
 * Tests for complete workflows and module interactions
 */

describe('Integration Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.getElementById('grid').innerHTML = '';
        document.getElementById('queueToast').style.display = 'none';
        document.getElementById('autoMergeHint').style.display = 'none';
        document.getElementById('mergeModal').style.display = 'none';

        // Create global instances
        global.core = new ContactManager();
        global.mergeTool = new MergeTool();
        global.autoMerger = new AutoMerger();

        vi.clearAllMocks();
    });

    describe('Complete Merge Workflow', () => {
        test('should merge two contacts into one', () => {
            // Setup contacts
            core.contacts = [
                { _id: 'id1', fn: 'John Doe', tels: ['612345678'], emails: ['john@test.com'], org: 'Company A' },
                { _id: 'id2', fn: 'John D', tels: ['698765432'], emails: ['johnd@test.com'], org: '' }
            ];

            // Select both contacts
            core.toggleSelect('id1');
            core.toggleSelect('id2');

            // Initialize merge
            mergeTool.init();

            // Verify pending is created
            expect(mergeTool.pending).not.toBeNull();
            expect(mergeTool.pending.data.tels.length).toBe(2);
            expect(mergeTool.pending.data.emails.length).toBe(2);

            // Commit merge
            mergeTool.commit();

            // Verify result
            expect(core.contacts.length).toBe(1);
            expect(core.contacts[0].fn).toBe('John Doe');
            expect(core.contacts[0].tels.length).toBe(2);
            expect(core.contacts[0].emails.length).toBe(2);
        });

        test('should handle editing a single contact', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: [], org: '' }
            ];

            core.toggleSelect('id1');
            mergeTool.init();

            // Modify name
            mergeTool.pending.data.fn = 'John Modified';
            mergeTool.commit();

            expect(core.contacts[0].fn).toBe('John Modified');
        });
    });

    describe('Auto Merge Workflow', () => {
        test('should process duplicate names sequentially', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: [], org: '' },
                { _id: 'id2', fn: 'John', tels: ['222'], emails: [], org: '' },
                { _id: 'id3', fn: 'Jane', tels: ['333'], emails: [], org: '' },
                { _id: 'id4', fn: 'Jane', tels: ['444'], emails: [], org: '' }
            ];

            autoMerger.start('name');

            // First group should be shown
            expect(document.getElementById('mergeModal').style.display).toBe('flex');
            expect(core.selected.size).toBe(2);

            // Commit first merge
            mergeTool.commit();

            // Queue should continue
            expect(autoMerger.active).toBe(true);
        });

        test('should find phone duplicates with different formats', () => {
            core.contacts = [
                { _id: 'id1', fn: 'Contact A', tels: ['+34612345678'], emails: [], org: '' },
                { _id: 'id2', fn: 'Contact B', tels: ['612345678'], emails: [], org: '' },
                { _id: 'id3', fn: 'Contact C', tels: ['0034612345678'], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            autoMerger.start('phone');

            // All three should be in one group
            expect(autoMerger.queue.length).toBe(1);
            expect(autoMerger.queue[0].length).toBe(3);
        });
    });

    describe('Filter and Selection', () => {
        test('should maintain selection after filter change', () => {
            core.contacts = [
                { _id: 'id1', fn: 'Alpha', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Beta', tels: [], emails: [], org: '' }
            ];

            // Select Alpha
            core.toggleSelect('id1');
            expect(core.selected.size).toBe(1);

            // Filter to show only Beta
            core.setFilter('beta');

            // Selection should persist
            expect(core.selected.size).toBe(1);
            expect(core.selected.has('id1')).toBe(true);
        });

        test('should update FAB based on selection', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            core.render();

            expect(document.getElementById('fab').classList.contains('visible')).toBe(false);

            core.toggleSelect('id1');

            expect(document.getElementById('fab').classList.contains('visible')).toBe(true);
        });
    });

    describe('VCF Import/Export Cycle', () => {
        test('should maintain data through import-export cycle', () => {
            const originalVCF = `BEGIN:VCARD
VERSION:3.0
FN:Test Contact
TEL:+34612345678
EMAIL:test@example.com
ORG:Test Company
END:VCARD`;

            // Import
            const mockFile = createMockVCFFile(originalVCF);
            core.loadFile(mockFile);

            expect(core.contacts.length).toBe(1);
            expect(core.contacts[0].fn).toBe('Test Contact');
            expect(core.contacts[0].tels).toContain('+34612345678');
            expect(core.contacts[0].emails).toContain('test@example.com');
            expect(core.contacts[0].org).toBe('Test Company');
        });
    });

    describe('Master Swap Workflow', () => {
        test('should correctly swap master and update pending', () => {
            core.contacts = [
                { _id: 'id1', fn: 'Short', tels: ['111'], emails: [], org: 'Org A' },
                { _id: 'id2', fn: 'Much Longer Name', tels: ['222'], emails: [], org: 'Org B' }
            ];

            core.selectOrder = ['id1', 'id2'];
            mergeTool.init();

            expect(mergeTool.pending.targetId).toBe('id1');
            expect(mergeTool.pending.data.fn).toBe('Short');

            // Swap master
            mergeTool.swapMaster('id2');

            expect(mergeTool.pending.targetId).toBe('id2');
            expect(mergeTool.pending.data.fn).toBe('Much Longer Name');
            expect(mergeTool.pending.data.org).toBe('Org B');
        });
    });

    describe('Edge Cases', () => {
        test('should handle contact with no phone numbers', () => {
            core.contacts = [
                { _id: 'id1', fn: 'No Phone', tels: [], emails: ['email@test.com'], org: '' }
            ];

            core.render();

            const card = document.querySelector('.card');
            expect(card).toBeTruthy();
            expect(card.textContent).toContain('No Phone');
        });

        test('should handle contact with many phone numbers', () => {
            core.contacts = [
                {
                    _id: 'id1',
                    fn: 'Many Phones',
                    tels: ['111', '222', '333', '444', '555'],
                    emails: [],
                    org: ''
                }
            ];

            core.render();

            const card = document.querySelector('.card');
            expect(card.textContent).toContain('+2');
        });

        test('should handle empty contacts list', () => {
            core.contacts = [];
            core.render();

            expect(document.getElementById('grid').innerHTML).toContain(Config.messages.noData);
        });

        test('should handle special characters in names', () => {
            core.contacts = [
                { _id: 'id1', fn: 'Jose Garcia-Lopez', tels: [], emails: [], org: '' }
            ];

            core.render();

            const card = document.querySelector('.card');
            expect(card.textContent).toContain('Jose Garcia-Lopez');
        });
    });

    describe('Delete Workflow', () => {
        test('should delete selected contacts and clear selection', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' },
                { _id: 'id3', fn: 'Bob', tels: [], emails: [], org: '' }
            ];

            core.toggleSelect('id1');
            core.toggleSelect('id2');

            confirm.mockReturnValue(true);
            core.deleteSelected();

            expect(core.contacts.length).toBe(1);
            expect(core.contacts[0].fn).toBe('Bob');
            expect(core.selected.size).toBe(0);
        });
    });

    describe('Sort Workflow', () => {
        test('should toggle sort and render correctly', () => {
            core.contacts = [
                { _id: 'id1', fn: 'Zulu', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Alpha', tels: [], emails: [], org: '' },
                { _id: 'id3', fn: 'Mike', tels: [], emails: [], org: '' }
            ];

            // First render - creation order
            core.render();
            let cards = document.querySelectorAll('.card');
            expect(cards[0].textContent).toContain('Zulu');

            // Toggle sort - alphabetical
            core.toggleSort();
            cards = document.querySelectorAll('.card');
            expect(cards[0].textContent).toContain('Alpha');
            expect(cards[1].textContent).toContain('Mike');
            expect(cards[2].textContent).toContain('Zulu');

            // Toggle back - creation order
            core.toggleSort();
            cards = document.querySelectorAll('.card');
            expect(cards[0].textContent).toContain('Zulu');
        });
    });
});
