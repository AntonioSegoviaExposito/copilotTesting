/**
 * AutoMerger Tests
 * Tests for automatic duplicate detection functionality
 */

describe('AutoMerger', () => {
    beforeEach(() => {
        // Reset DOM
        document.getElementById('grid').innerHTML = '';
        document.getElementById('queueToast').style.display = 'none';
        document.getElementById('autoMergeHint').style.display = 'none';

        // Create global instances
        global.core = new ContactManager();
        global.mergeTool = new MergeTool();
        global.autoMerger = new AutoMerger();

        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with empty queue', () => {
            expect(autoMerger.queue).toEqual([]);
        });

        test('should initialize with active as false', () => {
            expect(autoMerger.active).toBe(false);
        });
    });

    describe('start - Name Mode', () => {
        test('should show warning toast when contacts list is empty', () => {
            core.contacts = [];
            autoMerger.start('name');
            expect(Toast.warning).toHaveBeenCalledWith(Config.messages.emptyAgenda);
        });

        test('should find duplicates by name', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John Doe', tels: ['111'], emails: [], org: '' },
                { _id: 'id2', fn: 'John Doe', tels: ['222'], emails: [], org: '' },
                { _id: 'id3', fn: 'Jane Smith', tels: ['333'], emails: [], org: '' }
            ];

            // Mock processNext to prevent full execution
            autoMerger.processNext = vi.fn();
            await autoMerger.start('name');

            expect(autoMerger.queue.length).toBe(1);
            expect(autoMerger.queue[0]).toContain('id1');
            expect(autoMerger.queue[0]).toContain('id2');
        });

        test('should be case insensitive for name matching', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'JOHN DOE', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'john doe', tels: [], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('name');

            expect(autoMerger.queue.length).toBe(1);
        });

        test('should trim names when matching', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John Doe  ', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: '  John Doe', tels: [], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('name');

            expect(autoMerger.queue.length).toBe(1);
        });

        test('should show info toast when no duplicates found', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];

            await autoMerger.start('name');
            expect(Toast.info).toHaveBeenCalledWith(Config.messages.noDuplicates);
        });

        test('should set active to true when duplicates found', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'John', tels: [], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('name');

            expect(autoMerger.active).toBe(true);
        });

        test('should handle multiple duplicate groups', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id3', fn: 'Jane', tels: [], emails: [], org: '' },
                { _id: 'id4', fn: 'Jane', tels: [], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('name');

            expect(autoMerger.queue.length).toBe(2);
        });
    });

    describe('start - Phone Mode', () => {
        test('should find duplicates by phone number', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['+34612345678'], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: ['612345678'], emails: [], org: '' },
                { _id: 'id3', fn: 'Bob', tels: ['+34999999999'], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('phone');

            expect(autoMerger.queue.length).toBe(1);
        });

        test('should normalize phone numbers when comparing', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['0034612345678'], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: ['+34612345678'], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('phone');

            expect(autoMerger.queue.length).toBe(1);
        });

        test('should find duplicates when contact has multiple phones', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111111111', '222222222'], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: ['333333333', '111111111'], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('phone');

            expect(autoMerger.queue.length).toBe(1);
        });

        test('should not duplicate contact in group when multiple phones match', async () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111111111', '222222222'], emails: [], org: '' },
                { _id: 'id2', fn: 'Same John', tels: ['111111111', '222222222'], emails: [], org: '' }
            ];

            autoMerger.processNext = vi.fn();
            await autoMerger.start('phone');

            // Should only have one group even though both phones match
            const flatIds = autoMerger.queue.flat();
            const uniqueIds = [...new Set(flatIds)];
            expect(uniqueIds.length).toBe(flatIds.length);
        });
    });

    describe('processNext', () => {
        test('should set active to false when queue is empty', () => {
            autoMerger.active = true;
            autoMerger.queue = [];
            autoMerger.processNext();

            expect(autoMerger.active).toBe(false);
        });

        test('should show completion success toast when queue is empty', () => {
            autoMerger.queue = [];
            autoMerger.processNext();

            expect(Toast.success).toHaveBeenCalledWith(Config.messages.autoMergeComplete);
        });

        test('should hide toast and hint when completed', () => {
            autoMerger.queue = [];
            autoMerger.processNext();

            expect(document.getElementById('queueToast').style.display).toBe('none');
            expect(document.getElementById('autoMergeHint').style.display).toBe('none');
        });

        test('should skip groups with less than 2 valid contacts', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            autoMerger.queue = [['id1', 'nonexistent']];
            autoMerger.processNext();

            expect(Toast.success).toHaveBeenCalledWith(Config.messages.autoMergeComplete);
        });
    });

    describe('cancel', () => {
        test('should set active to false', () => {
            autoMerger.active = true;
            autoMerger.cancel();
            expect(autoMerger.active).toBe(false);
        });

        test('should hide UI elements', () => {
            document.getElementById('queueToast').style.display = 'block';
            document.getElementById('autoMergeHint').style.display = 'block';
            
            autoMerger.cancel();

            expect(document.getElementById('queueToast').style.display).toBe('none');
            expect(document.getElementById('autoMergeHint').style.display).toBe('none');
        });

        test('should show cancelled info toast', () => {
            autoMerger.cancel();
            expect(Toast.info).toHaveBeenCalledWith(Config.messages.autoMergeCancelled);
        });
    });
});
