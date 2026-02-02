/**
 * MergeTool Tests
 * Tests for contact merging and editing functionality
 */

describe('MergeTool', () => {
    beforeEach(() => {
        // Reset DOM
        document.getElementById('mergeModal').style.display = 'none';
        document.getElementById('modalTitle').innerText = '';
        document.getElementById('mergeSourcesList').innerHTML = '';
        document.getElementById('mergeResultForm').innerHTML = '';

        // Create global instances
        global.core = new ContactManager();
        global.autoMerger = new AutoMerger();
        global.mergeTool = new MergeTool();

        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with pending as null', () => {
            expect(mergeTool.pending).toBeNull();
        });
    });

    describe('init', () => {
        test('should return early when selectOrder is empty', () => {
            core.selectOrder = [];
            const buildSpy = vi.spyOn(mergeTool, 'buildPending');

            mergeTool.init();

            expect(buildSpy).not.toHaveBeenCalled();
        });

        test('should call buildPending with selectOrder', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: ['a@b.com'], org: 'Test' }
            ];
            core.selectOrder = ['id1'];

            const buildSpy = vi.spyOn(mergeTool, 'buildPending');
            mergeTool.init();

            expect(buildSpy).toHaveBeenCalledWith(['id1']);
        });

        test('should call renderUI after buildPending', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            core.selectOrder = ['id1'];

            const renderSpy = vi.spyOn(mergeTool, 'renderUI');
            mergeTool.init();

            expect(renderSpy).toHaveBeenCalled();
        });
    });

    describe('buildPending', () => {
        beforeEach(() => {
            core.contacts = [
                {
                    _id: 'id1',
                    fn: 'John Doe',
                    tels: ['+34612345678'],
                    emails: ['john@test.com'],
                    org: 'Company A',
                    title: 'CEO'
                },
                {
                    _id: 'id2',
                    fn: 'John D.',
                    tels: ['+34698765432'],
                    emails: ['johnd@test.com'],
                    org: '',
                    adr: '123 Main St'
                },
                {
                    _id: 'id3',
                    fn: 'Johnny',
                    tels: ['+34611111111'],
                    emails: [],
                    org: 'Company B',
                    note: 'Important contact'
                }
            ];
        });

        test('should set targetId to first id', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.targetId).toBe('id1');
        });

        test('should set idsToRemove to all provided ids', () => {
            mergeTool.buildPending(['id1', 'id2', 'id3']);
            expect(mergeTool.pending.idsToRemove).toEqual(['id1', 'id2', 'id3']);
        });

        test('should use master contact fn', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.fn).toBe('John Doe');
        });

        test('should combine all phone numbers', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.tels.length).toBe(2);
            expect(mergeTool.pending.data.tels).toContain('+34612345678');
            expect(mergeTool.pending.data.tels).toContain('+34698765432');
        });

        test('should combine all emails', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.emails.length).toBe(2);
            expect(mergeTool.pending.data.emails).toContain('john@test.com');
            expect(mergeTool.pending.data.emails).toContain('johnd@test.com');
        });

        test('should deduplicate phone numbers', () => {
            core.contacts[1].tels = ['+34612345678']; // Same as id1
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.tels.length).toBe(1);
        });

        test('should deduplicate emails', () => {
            core.contacts[1].emails = ['john@test.com']; // Same as id1
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.emails.length).toBe(1);
        });

        test('should use master org, fallback to slave', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.org).toBe('Company A');

            mergeTool.buildPending(['id2', 'id1']);
            expect(mergeTool.pending.data.org).toBe('Company A'); // Fallback from slave
        });

        test('should preserve title from master or slave', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.title).toBe('CEO');

            mergeTool.buildPending(['id2', 'id1']);
            expect(mergeTool.pending.data.title).toBe('CEO'); // From slave
        });

        test('should preserve address from slave when master has none', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.data.adr).toBe('123 Main St');
        });

        test('should preserve note from slave when master has none', () => {
            mergeTool.buildPending(['id1', 'id3']);
            expect(mergeTool.pending.data.note).toBe('Important contact');
        });

        test('should store original objects', () => {
            mergeTool.buildPending(['id1', 'id2']);
            expect(mergeTool.pending.originalObjects.length).toBe(2);
            expect(mergeTool.pending.originalObjects[0]._id).toBe('id1');
        });
    });

    describe('swapMaster', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: [], org: 'Org1' },
                { _id: 'id2', fn: 'Jane', tels: ['222'], emails: [], org: 'Org2' }
            ];
            core.selectOrder = ['id1', 'id2'];
            mergeTool.init();
        });

        test('should not change anything when same id passed', () => {
            const originalFn = mergeTool.pending.data.fn;
            mergeTool.swapMaster('id1');
            expect(mergeTool.pending.data.fn).toBe(originalFn);
        });

        test('should change master to new id', () => {
            mergeTool.swapMaster('id2');
            expect(mergeTool.pending.targetId).toBe('id2');
        });

        test('should update fn to new master name', () => {
            mergeTool.swapMaster('id2');
            expect(mergeTool.pending.data.fn).toBe('Jane');
        });

        test('should update org to new master org', () => {
            mergeTool.swapMaster('id2');
            expect(mergeTool.pending.data.org).toBe('Org2');
        });

        test('should reorder idsToRemove with new master first', () => {
            mergeTool.swapMaster('id2');
            expect(mergeTool.pending.idsToRemove[0]).toBe('id2');
        });
    });

    describe('renderUI', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: ['222'], emails: [], org: '' }
            ];
            core.selectOrder = ['id1', 'id2'];
            mergeTool.buildPending(['id1', 'id2']);
        });

        test('should display merge modal', () => {
            mergeTool.renderUI();
            expect(document.getElementById('mergeModal').style.display).toBe('flex');
        });

        test('should set modal title for merge', () => {
            mergeTool.renderUI();
            expect(document.getElementById('modalTitle').innerText).toContain('2');
        });

        test('should set modal title for single edit', () => {
            mergeTool.buildPending(['id1']);
            mergeTool.renderUI();
            expect(document.getElementById('modalTitle').innerText).toContain('Edit');
        });

        test('should render source items', () => {
            mergeTool.renderUI();
            const sourcesList = document.getElementById('mergeSourcesList');
            expect(sourcesList.querySelectorAll('.source-item').length).toBe(2);
        });

        test('should mark first item as master', () => {
            mergeTool.renderUI();
            const sourcesList = document.getElementById('mergeSourcesList');
            expect(sourcesList.querySelector('.source-item.master')).toBeTruthy();
        });
    });

    describe('addField', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: ['a@b.com'], org: '' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should add empty string to tels array', () => {
            const initialLength = mergeTool.pending.data.tels.length;
            mergeTool.addField('tels');
            expect(mergeTool.pending.data.tels.length).toBe(initialLength + 1);
            expect(mergeTool.pending.data.tels[mergeTool.pending.data.tels.length - 1]).toBe('');
        });

        test('should add empty string to emails array', () => {
            const initialLength = mergeTool.pending.data.emails.length;
            mergeTool.addField('emails');
            expect(mergeTool.pending.data.emails.length).toBe(initialLength + 1);
        });
    });

    describe('addCustomField', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should add title field when selected', () => {
            document.getElementById('addFieldSelector').value = 'title';
            mergeTool.addCustomField();
            expect(mergeTool.pending.data.title).toBeDefined();
        });

        test('should add adr field when selected', () => {
            document.getElementById('addFieldSelector').value = 'adr';
            mergeTool.addCustomField();
            expect(mergeTool.pending.data.adr).toBeDefined();
        });

        test('should not overwrite existing field', () => {
            mergeTool.pending.data.title = 'Existing Title';
            document.getElementById('addFieldSelector').value = 'title';
            mergeTool.addCustomField();
            expect(mergeTool.pending.data.title).toBe('Existing Title');
        });
    });

    describe('removeItem', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111', '222', '333'], emails: ['a@b.com', 'c@d.com'], org: '' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should remove phone at specified index', () => {
            const initialLength = mergeTool.pending.data.tels.length;
            mergeTool.removeItem('tels', 1);
            expect(mergeTool.pending.data.tels.length).toBe(initialLength - 1);
        });

        test('should remove email at specified index', () => {
            mergeTool.removeItem('emails', 0);
            expect(mergeTool.pending.data.emails).not.toContain('a@b.com');
        });

        test('should maintain other items', () => {
            const originalLength = mergeTool.pending.data.tels.length;
            mergeTool.removeItem('tels', 0);
            expect(mergeTool.pending.data.tels.length).toBe(originalLength - 1);
        });
    });

    describe('commit', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: ['111'], emails: ['a@b.com'], org: 'Org1' },
                { _id: 'id2', fn: 'John Copy', tels: ['222'], emails: ['b@c.com'], org: '' },
                { _id: 'id3', fn: 'Other', tels: ['333'], emails: [], org: '' }
            ];
            core.selectOrder = ['id1', 'id2'];
            core.selected.add('id1');
            core.selected.add('id2');
            mergeTool.init();
        });

        test('should remove merged contacts from list', () => {
            mergeTool.commit();
            expect(core.contacts.find(c => c._id === 'id2')).toBeUndefined();
        });

        test('should add merged contact to beginning of list', () => {
            mergeTool.commit();
            expect(core.contacts[0]._id).toBe('id1');
        });

        test('should preserve non-merged contacts', () => {
            mergeTool.commit();
            expect(core.contacts.find(c => c._id === 'id3')).toBeTruthy();
        });

        test('should clear selection after commit', () => {
            mergeTool.commit();
            expect(core.selected.size).toBe(0);
            expect(core.selectOrder.length).toBe(0);
        });

        test('should filter empty phone numbers', () => {
            mergeTool.pending.data.tels.push('');
            mergeTool.commit();
            expect(core.contacts[0].tels).not.toContain('');
        });

        test('should filter empty emails', () => {
            mergeTool.pending.data.emails.push('');
            mergeTool.commit();
            expect(core.contacts[0].emails).not.toContain('');
        });

        test('should use pending data for new contact', () => {
            mergeTool.pending.data.fn = 'Modified Name';
            mergeTool.commit();
            expect(core.contacts[0].fn).toBe('Modified Name');
        });

        test('should close modal after commit', () => {
            mergeTool.commit();
            expect(document.getElementById('mergeModal').style.display).toBe('none');
        });

        test('should trigger autoMerger processNext when active', () => {
            autoMerger.active = true;
            const processSpy = vi.spyOn(autoMerger, 'processNext');

            vi.useFakeTimers();
            mergeTool.commit();
            vi.advanceTimersByTime(250);

            expect(processSpy).toHaveBeenCalled();
            vi.useRealTimers();
        });
    });

    describe('close', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should hide merge modal', () => {
            document.getElementById('mergeModal').style.display = 'flex';
            mergeTool.close();
            expect(document.getElementById('mergeModal').style.display).toBe('none');
        });

        test('should set pending to null', () => {
            mergeTool.close();
            expect(mergeTool.pending).toBeNull();
        });

        test('should deactivate autoMerger when not success', () => {
            autoMerger.active = true;
            mergeTool.close(false);
            expect(autoMerger.active).toBe(false);
        });

        test('should not deactivate autoMerger when success', () => {
            autoMerger.active = true;
            mergeTool.close(true);
            expect(autoMerger.active).toBe(true);
        });
    });

    describe('renderResultForm', () => {
        beforeEach(() => {
            core.contacts = [
                {
                    _id: 'id1',
                    fn: 'John Doe',
                    tels: ['612345678'],
                    emails: ['john@test.com'],
                    org: 'Test Org',
                    title: 'Manager',
                    adr: '123 Street',
                    note: 'Test note',
                    url: 'https://test.com',
                    bday: '1990-01-15'
                }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should render name input', () => {
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Nombre Completo');
            expect(form.innerHTML).toContain('John Doe');
        });

        test('should render phone inputs', () => {
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Teléfonos');
        });

        test('should render email inputs', () => {
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Emails');
        });

        test('should render org input when org exists', () => {
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Organización');
        });

        test('should render optional fields when present', () => {
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Cargo');
            expect(form.innerHTML).toContain('Dirección');
            expect(form.innerHTML).toContain('Notas');
            expect(form.innerHTML).toContain('Sitio Web');
            expect(form.innerHTML).toContain('Cumpleaños');
        });

        test('should not render optional fields when undefined', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            mergeTool.buildPending(['id1']);
            mergeTool.renderResultForm();

            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).not.toContain('Cargo');
            expect(form.innerHTML).not.toContain('Dirección');
            // Org should also not be present when empty
            expect(form.innerHTML).not.toContain('Organización');
        });

        test('should render organization field with datalist', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: 'Company A' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: 'Company B' }
            ];
            mergeTool.buildPending(['id1']);
            mergeTool.renderResultForm();

            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('orgList');
            expect(form.innerHTML).toContain('Company A');
            expect(form.innerHTML).toContain('Company B');
        });

        test('should deduplicate organizations in datalist', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: 'Company A' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: 'Company A' },
                { _id: 'id3', fn: 'Bob', tels: [], emails: [], org: 'Company B' }
            ];
            mergeTool.buildPending(['id1']);
            mergeTool.renderResultForm();

            const form = document.getElementById('mergeResultForm');
            // Count occurrences in datalist options only
            const datalistMatches = form.innerHTML.match(/<option value="Company A">/g);
            expect(datalistMatches.length).toBe(1); // Should appear only once in datalist
        });
    });

    describe('cloneContact', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John Doe', tels: ['+34612345678'], emails: ['john@test.com'], org: 'Company A' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should create a cloned contact', () => {
            const initialCount = core.contacts.length;
            mergeTool.cloneContact();
            expect(core.contacts.length).toBe(initialCount + 1);
        });

        test('should add clone with unique ID', () => {
            mergeTool.cloneContact();
            const clone = core.contacts[0];
            
            expect(clone._id).not.toBe('id1');
            expect(clone._id).toMatch(/^clone_/);
        });

        test('should copy all contact data', () => {
            mergeTool.cloneContact();
            const clone = core.contacts[0];
            
            expect(clone.fn).toContain('John Doe');
            expect(clone.tels).toContain('+34612345678');
            expect(clone.emails).toContain('john@test.com');
            expect(clone.org).toBe('Company A');
        });

        test('should add "(Copia)" to cloned name', () => {
            mergeTool.cloneContact();
            const clone = core.contacts[0];
            
            expect(clone.fn).toContain('(Copia)');
        });

        test('should close modal after cloning', () => {
            mergeTool.cloneContact();
            expect(document.getElementById('mergeModal').style.display).toBe('none');
        });

        test('should show success alert', () => {
            mergeTool.cloneContact();
            expect(alert).toHaveBeenCalledWith('Contacto clonado correctamente');
        });

        test('should not clone when multiple contacts selected', () => {
            core.contacts.push({ _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' });
            mergeTool.buildPending(['id1', 'id2']);
            
            const initialCount = core.contacts.length;
            mergeTool.cloneContact();
            
            expect(core.contacts.length).toBe(initialCount);
        });

        test('should filter empty phone numbers when cloning', () => {
            mergeTool.pending.data.tels = ['+34612345678', '', '+34698765432', ''];
            mergeTool.cloneContact();
            
            const clone = core.contacts[0];
            expect(clone.tels).toEqual(['+34612345678', '+34698765432']);
        });

        test('should filter empty emails when cloning', () => {
            mergeTool.pending.data.emails = ['john@test.com', '', 'jane@test.com', ''];
            mergeTool.cloneContact();
            
            const clone = core.contacts[0];
            expect(clone.emails).toEqual(['john@test.com', 'jane@test.com']);
        });
    });

    describe('renderUI - Clone Button', () => {
        test('should show clone button for single contact', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            mergeTool.buildPending(['id1']);
            mergeTool.renderUI();
            
            const cloneBtn = document.getElementById('cloneButton');
            expect(cloneBtn.style.display).toBe('block');
        });

        test('should hide clone button for multiple contacts', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];
            mergeTool.buildPending(['id1', 'id2']);
            mergeTool.renderUI();
            
            const cloneBtn = document.getElementById('cloneButton');
            expect(cloneBtn.style.display).toBe('none');
        });
    });

    describe('addCustomField - Organization', () => {
        beforeEach(() => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            core.selectOrder = ['id1'];
            mergeTool.init();
        });

        test('should add org field when selected from dropdown', () => {
            // Org should be undefined initially (empty string becomes undefined)
            expect(mergeTool.pending.data.org).toBeUndefined();
            
            document.getElementById('addFieldSelector').value = 'org';
            mergeTool.addCustomField();
            
            expect(mergeTool.pending.data.org).toBeDefined();
        });

        test('should render org field after adding via dropdown', () => {
            document.getElementById('addFieldSelector').value = 'org';
            mergeTool.addCustomField();
            
            const form = document.getElementById('mergeResultForm');
            expect(form.innerHTML).toContain('Organización');
            expect(form.innerHTML).toContain('orgList'); // datalist for autocomplete
        });

        test('should not overwrite existing org field', () => {
            mergeTool.pending.data.org = 'Existing Company';
            document.getElementById('addFieldSelector').value = 'org';
            mergeTool.addCustomField();
            expect(mergeTool.pending.data.org).toBe('Existing Company');
        });
    });

    describe('Optional Fields Behavior', () => {
        test('should treat org as optional field like title, adr, etc.', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            mergeTool.buildPending(['id1']);
            
            // org should be undefined when empty (not empty string)
            expect(mergeTool.pending.data.org).toBeUndefined();
            expect(mergeTool.pending.data.title).toBeUndefined();
            expect(mergeTool.pending.data.adr).toBeUndefined();
        });

        test('should preserve org when contact has value', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: 'MyCompany' }
            ];
            mergeTool.buildPending(['id1']);
            
            expect(mergeTool.pending.data.org).toBe('MyCompany');
        });

        test('should fallback to slave org when master has none', () => {
            core.contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'John Copy', tels: [], emails: [], org: 'SlaveCompany' }
            ];
            mergeTool.buildPending(['id1', 'id2']);
            
            expect(mergeTool.pending.data.org).toBe('SlaveCompany');
        });
    });
});
