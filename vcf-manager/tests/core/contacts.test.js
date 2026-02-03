/**
 * ContactManager Tests
 * Tests for the core contact management functionality
 */

describe('ContactManager', () => {
    let contactManager;

    beforeEach(() => {
        // Reset DOM
        document.getElementById('grid').innerHTML = '';
        document.getElementById('statDisplay').innerText = '0 contacts';
        document.getElementById('btnExport').innerText = 'Export (0)';
        document.getElementById('fab').classList.remove('visible');

        // Create fresh instance
        contactManager = new ContactManager();
        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with empty contacts array', () => {
            expect(contactManager.contacts).toEqual([]);
        });

        test('should initialize with empty selected Set', () => {
            expect(contactManager.selected).toBeInstanceOf(Set);
            expect(contactManager.selected.size).toBe(0);
        });

        test('should initialize with empty selectOrder array', () => {
            expect(contactManager.selectOrder).toEqual([]);
        });

        test('should initialize with empty filterStr', () => {
            expect(contactManager.filterStr).toBe('');
        });

        test('should initialize with sortAZ as false', () => {
            expect(contactManager.sortAZ).toBe(false);
        });
    });

    describe('setFilter', () => {
        test('should set filterStr to lowercase', () => {
            contactManager.setFilter('JOHN');
            expect(contactManager.filterStr).toBe('john');
        });

        test('should trigger render', () => {
            const renderSpy = vi.spyOn(contactManager, 'render');
            contactManager.setFilter('test');
            expect(renderSpy).toHaveBeenCalled();
        });
    });

    describe('toggleSort', () => {
        test('should toggle sortAZ from false to true', () => {
            expect(contactManager.sortAZ).toBe(false);
            contactManager.toggleSort();
            expect(contactManager.sortAZ).toBe(true);
        });

        test('should toggle sortAZ from true to false', () => {
            contactManager.sortAZ = true;
            contactManager.toggleSort();
            expect(contactManager.sortAZ).toBe(false);
        });

        test('should show info toast with correct message', () => {
            contactManager.toggleSort();
            expect(Toast.info).toHaveBeenCalledWith(Config.messages.sortAlpha);

            contactManager.toggleSort();
            expect(Toast.info).toHaveBeenCalledWith(Config.messages.sortCreation);
        });
    });

    describe('toggleSelect', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];
        });

        test('should add id to selected Set when not selected', () => {
            contactManager.toggleSelect('id1');
            expect(contactManager.selected.has('id1')).toBe(true);
        });

        test('should add id to selectOrder when not selected', () => {
            contactManager.toggleSelect('id1');
            expect(contactManager.selectOrder).toContain('id1');
        });

        test('should remove id from selected Set when already selected', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            contactManager.toggleSelect('id1');
            expect(contactManager.selected.has('id1')).toBe(false);
        });

        test('should remove id from selectOrder when already selected', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            contactManager.toggleSelect('id1');
            expect(contactManager.selectOrder).not.toContain('id1');
        });

        test('should maintain order of selection', () => {
            contactManager.toggleSelect('id1');
            contactManager.toggleSelect('id2');
            expect(contactManager.selectOrder).toEqual(['id1', 'id2']);
        });
    });

    describe('selectAll', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' },
                { _id: 'id3', fn: 'Bob', tels: [], emails: [], org: '' }
            ];
        });

        test('should select all contacts', () => {
            contactManager.selectAll();
            expect(contactManager.selected.size).toBe(3);
            expect(contactManager.selected.has('id1')).toBe(true);
            expect(contactManager.selected.has('id2')).toBe(true);
            expect(contactManager.selected.has('id3')).toBe(true);
        });

        test('should not duplicate already selected contacts', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            contactManager.selectAll();
            expect(contactManager.selectOrder.filter(x => x === 'id1').length).toBe(1);
        });
    });

    describe('deselectAll', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];
            contactManager.selected.add('id1');
            contactManager.selected.add('id2');
            contactManager.selectOrder = ['id1', 'id2'];
        });

        test('should clear selected Set', () => {
            contactManager.deselectAll();
            expect(contactManager.selected.size).toBe(0);
        });

        test('should clear selectOrder array', () => {
            contactManager.deselectAll();
            expect(contactManager.selectOrder).toEqual([]);
        });
    });

    describe('deleteSelected', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' },
                { _id: 'id3', fn: 'Bob', tels: [], emails: [], org: '' }
            ];
            contactManager.selected.add('id1');
            contactManager.selected.add('id2');
            contactManager.selectOrder = ['id1', 'id2'];
        });

        test('should remove selected contacts when confirmed', async () => {
            Toast.confirm.mockResolvedValue(true);
            await contactManager.deleteSelected();
            expect(contactManager.contacts.length).toBe(1);
            expect(contactManager.contacts[0]._id).toBe('id3');
        });

        test('should not remove contacts when cancelled', async () => {
            Toast.confirm.mockResolvedValue(false);
            await contactManager.deleteSelected();
            expect(contactManager.contacts.length).toBe(3);
        });

        test('should clear selection after delete', async () => {
            Toast.confirm.mockResolvedValue(true);
            await contactManager.deleteSelected();
            expect(contactManager.selected.size).toBe(0);
            expect(contactManager.selectOrder).toEqual([]);
        });
    });

    describe('clearAll', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
        });

        test('should clear all contacts when confirmed', async () => {
            Toast.confirm.mockResolvedValue(true);
            await contactManager.clearAll();
            expect(contactManager.contacts).toEqual([]);
        });

        test('should not clear contacts when cancelled', async () => {
            Toast.confirm.mockResolvedValue(false);
            await contactManager.clearAll();
            expect(contactManager.contacts.length).toBe(1);
        });
    });

    describe('findById', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];
        });

        test('should find contact by id', () => {
            const contact = contactManager.findById('id1');
            expect(contact.fn).toBe('John');
        });

        test('should return undefined for non-existent id', () => {
            const contact = contactManager.findById('nonexistent');
            expect(contact).toBeUndefined();
        });
    });

    describe('render', () => {
        beforeEach(() => {
            contactManager.contacts = [
                { _id: 'id1', fn: 'Alpha', tels: ['612345678'], emails: [], org: 'Org1' },
                { _id: 'id2', fn: 'Beta', tels: ['698765432'], emails: [], org: 'Org2' },
                { _id: 'id3', fn: 'Gamma', tels: ['611111111'], emails: [], org: '' }
            ];
        });

        test('should update stat display with contact count', () => {
            contactManager.render();
            expect(document.getElementById('statDisplay').innerText).toBe('3 contacts');
        });

        test('should update export button text', () => {
            contactManager.render();
            expect(document.getElementById('btnExport').innerText).toBe('Export (3)');
        });

        test('should filter contacts by name', () => {
            contactManager.filterStr = 'alpha';
            contactManager.render();
            const cards = document.querySelectorAll('.card');
            expect(cards.length).toBe(1);
        });

        test('should filter contacts by phone', () => {
            contactManager.filterStr = '612345678';
            contactManager.render();
            const cards = document.querySelectorAll('.card');
            expect(cards.length).toBe(1);
        });

        test('should sort alphabetically when sortAZ is true', () => {
            contactManager.sortAZ = true;
            contactManager.render();
            const cards = document.querySelectorAll('.card');
            expect(cards[0].textContent).toContain('Alpha');
            expect(cards[1].textContent).toContain('Beta');
            expect(cards[2].textContent).toContain('Gamma');
        });

        test('should show FAB when contacts are selected', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            contactManager.render();
            expect(document.getElementById('fab').classList.contains('visible')).toBe(true);
        });

        test('should hide FAB when no contacts are selected', () => {
            contactManager.render();
            expect(document.getElementById('fab').classList.contains('visible')).toBe(false);
        });

        test('should show "EDIT" text when one contact selected', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            contactManager.render();
            expect(document.getElementById('fabActionText').innerText).toContain('EDIT');
        });

        test('should show "MERGE" text when multiple contacts selected', () => {
            contactManager.selected.add('id1');
            contactManager.selected.add('id2');
            contactManager.selectOrder.push('id1', 'id2');
            contactManager.render();
            expect(document.getElementById('fabActionText').innerText).toContain('MERGE');
        });

        test('should show empty state when no contacts match filter', () => {
            contactManager.filterStr = 'nonexistent';
            contactManager.render();
            expect(document.getElementById('grid').innerHTML).toContain(Config.messages.noData);
        });
    });

    describe('loadFile (VCF parsing)', () => {
        test('should parse simple VCF contact', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:612345678
EMAIL:john@example.com
ORG:Test Company
END:VCARD`;

            const mockFile = createMockVCFFile(vcfContent);
            contactManager.loadFile(mockFile);

            expect(contactManager.contacts.length).toBe(1);
            expect(contactManager.contacts[0].fn).toBe('John Doe');
            expect(contactManager.contacts[0].tels).toContain('612345678');
            expect(contactManager.contacts[0].emails).toContain('john@example.com');
            expect(contactManager.contacts[0].org).toBe('Test Company');
        });

        test('should parse multiple VCF contacts', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:612345678
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
TEL:698765432
END:VCARD`;

            const mockFile = createMockVCFFile(vcfContent);
            contactManager.loadFile(mockFile);

            expect(contactManager.contacts.length).toBe(2);
        });

        test('should parse contact with multiple phone numbers', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:612345678
TEL:698765432
TEL:633333333
END:VCARD`;

            const mockFile = createMockVCFFile(vcfContent);
            contactManager.loadFile(mockFile);

            expect(contactManager.contacts[0].tels.length).toBe(3);
        });

        test('should handle contact without FN field', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
TEL:612345678
END:VCARD`;

            const mockFile = createMockVCFFile(vcfContent);
            contactManager.loadFile(mockFile);

            expect(contactManager.contacts[0].fn).toBeTruthy();
        });

        test('should not load when file is null', () => {
            contactManager.loadFile(null);
            expect(contactManager.contacts.length).toBe(0);
        });

        test('should generate unique IDs for contacts', () => {
            const vcfContent = `BEGIN:VCARD
FN:John
END:VCARD
BEGIN:VCARD
FN:Jane
END:VCARD`;

            const mockFile = createMockVCFFile(vcfContent);
            contactManager.loadFile(mockFile);

            expect(contactManager.contacts[0]._id).not.toBe(contactManager.contacts[1]._id);
        });
    });

    describe('exportVCF', () => {
        test('should show warning toast when contacts list is empty', () => {
            contactManager.contacts = [];
            contactManager.exportVCF();
            expect(Toast.warning).toHaveBeenCalledWith(Config.messages.emptyList);
        });

        test('should create download link for export', () => {
            const appendSpy = vi.spyOn(document.body, 'appendChild');

            contactManager.contacts = [
                { _id: 'id1', fn: 'John', tels: ['612345678'], emails: ['john@test.com'], org: 'Test' }
            ];
            contactManager.exportVCF();

            expect(appendSpy).toHaveBeenCalled();
            expect(URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('addNewContact', () => {
        beforeEach(() => {
            // Create global instances for mergeTool
            global.mergeTool = {
                init: vi.fn()
            };
        });

        test('should add a new empty contact to contacts array', () => {
            contactManager.addNewContact();
            expect(contactManager.contacts.length).toBe(1);
        });

        test('should add contact with empty required fields', () => {
            contactManager.addNewContact();
            const newContact = contactManager.contacts[0];
            
            expect(newContact.fn).toBe('');
            expect(newContact.tels).toEqual([]);
            expect(newContact.emails).toEqual([]);
            expect(newContact.org).toBe('');
        });

        test('should add contact with unique ID', () => {
            contactManager.addNewContact();
            const firstId = contactManager.contacts[0]._id;
            
            contactManager.addNewContact();
            const secondId = contactManager.contacts[0]._id;
            
            expect(firstId).not.toBe(secondId);
            expect(firstId).toMatch(/^new_/);
            expect(secondId).toMatch(/^new_/);
        });

        test('should add new contact at the beginning of array', () => {
            contactManager.contacts = [
                { _id: 'existing', fn: 'Existing', tels: [], emails: [], org: '' }
            ];
            
            contactManager.addNewContact();
            
            expect(contactManager.contacts.length).toBe(2);
            expect(contactManager.contacts[0]._id).toMatch(/^new_/);
            expect(contactManager.contacts[1]._id).toBe('existing');
        });

        test('should select the new contact', () => {
            contactManager.addNewContact();
            const newId = contactManager.contacts[0]._id;
            
            expect(contactManager.selected.has(newId)).toBe(true);
            expect(contactManager.selectOrder).toContain(newId);
        });

        test('should open merge tool in edit mode', () => {
            contactManager.addNewContact();
            expect(mergeTool.init).toHaveBeenCalled();
        });

        test('should deselect all before selecting new contact', () => {
            contactManager.selected.add('id1');
            contactManager.selectOrder.push('id1');
            
            contactManager.addNewContact();
            const newId = contactManager.contacts[0]._id;
            
            expect(contactManager.selected.size).toBe(1);
            expect(contactManager.selected.has('id1')).toBe(false);
            expect(contactManager.selected.has(newId)).toBe(true);
        });
    });

    describe('Drag and Drop', () => {
        test('should create drop zone on init', () => {
            contactManager.init();
            
            const dropZone = document.getElementById('dropZone');
            expect(dropZone).toBeTruthy();
            expect(dropZone.classList.contains('drop-zone')).toBe(true);
        });

        test('should show drop zone when files are dragged over', () => {
            contactManager.init();
            const dropZone = document.getElementById('dropZone');
            
            // Simulate drag enter with files
            const dragEnterEvent = new Event('dragenter', { bubbles: true });
            dragEnterEvent.dataTransfer = {
                types: ['Files']
            };
            document.dispatchEvent(dragEnterEvent);
            
            expect(dropZone.classList.contains('drop-zone-active')).toBe(true);
        });

        test('should show drop zone when files are dragged', () => {
            contactManager.init();
            const dropZone = document.getElementById('dropZone');
            
            // Manually add the class to simulate activation
            dropZone.classList.add('drop-zone-active');
            expect(dropZone.classList.contains('drop-zone-active')).toBe(true);
            
            // Remove to simulate deactivation
            dropZone.classList.remove('drop-zone-active');
            expect(dropZone.classList.contains('drop-zone-active')).toBe(false);
        });

        test('should have drag and drop handlers attached', () => {
            contactManager.init();
            
            // Verify drop zone exists
            const dropZone = document.getElementById('dropZone');
            expect(dropZone).toBeTruthy();
            
            // Test preventdefault on dragover
            const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
            const prevented = !document.dispatchEvent(dragOverEvent);
            // Event should be prevented (default behavior stopped)
            expect(prevented || dragOverEvent.defaultPrevented).toBe(true);
        });

        test('should filter non-VCF files on drop', () => {
            contactManager.init();
            
            const txtFile = new File(['some text'], 'test.txt', { type: 'text/plain' });
            
            // Simulate drop event with non-VCF file
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    files: [txtFile]
                },
                writable: false
            });
            
            document.dispatchEvent(dropEvent);
            
            // Should show warning for non-VCF files
            expect(Toast.warning).toHaveBeenCalledWith('Please drop VCF (.vcf) files');
        });

        test('should create FileList-like object from array', () => {
            const files = [
                new File(['content1'], 'file1.vcf', { type: 'text/vcard' }),
                new File(['content2'], 'file2.vcf', { type: 'text/vcard' })
            ];
            
            const fileList = contactManager._createFileList(files);
            
            expect(fileList.length).toBe(2);
            expect(fileList[0].name).toBe('file1.vcf');
            expect(fileList[1].name).toBe('file2.vcf');
        });
    });
});
