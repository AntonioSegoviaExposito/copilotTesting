/**
 * VCFParser Tests
 * Tests for VCF parsing and export functionality
 */

describe('VCFParser', () => {
    describe('parse', () => {
        test('should parse simple VCF content', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:612345678
EMAIL:john@example.com
ORG:Test Company
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);

            expect(contacts.length).toBe(1);
            expect(contacts[0].fn).toBe('John Doe');
            expect(contacts[0].tels).toContain('612345678');
            expect(contacts[0].emails).toContain('john@example.com');
            expect(contacts[0].org).toBe('Test Company');
        });

        test('should parse multiple contacts', () => {
            const vcfContent = `BEGIN:VCARD
FN:John
END:VCARD
BEGIN:VCARD
FN:Jane
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts.length).toBe(2);
        });

        test('should handle Windows line endings', () => {
            const vcfContent = "BEGIN:VCARD\r\nFN:John\r\nEND:VCARD";
            const contacts = VCFParser.parse(vcfContent);
            expect(contacts.length).toBe(1);
            expect(contacts[0].fn).toBe('John');
        });

        test('should generate unique IDs', () => {
            const vcfContent = `BEGIN:VCARD
FN:John
END:VCARD
BEGIN:VCARD
FN:Jane
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0]._id).not.toBe(contacts[1]._id);
        });

        test('should use N field when FN is missing', () => {
            const vcfContent = `BEGIN:VCARD
N:Doe;John;;;
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].fn).toContain('John');
        });

        test('should handle optional fields', () => {
            const vcfContent = `BEGIN:VCARD
FN:John
TITLE:Manager
ADR:;;123 Main St;;;;
NOTE:Test note
URL:https://example.com
BDAY:1990-01-15
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].title).toBe('Manager');
            expect(contacts[0].adr).toContain('123 Main St');
            expect(contacts[0].note).toBe('Test note');
            expect(contacts[0].url).toBe('https://example.com');
            expect(contacts[0].bday).toBe('1990-01-15');
        });

        test('should parse vCard 4.0 specific fields', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
GENDER:M
ANNIVERSARY:2010-06-15
KIND:individual
LANG:en
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0]._originalVersion).toBe('4.0');
            expect(contacts[0].gender).toBe('M');
            expect(contacts[0].anniversary).toBe('2010-06-15');
            expect(contacts[0].kind).toBe('individual');
            expect(contacts[0].lang).toBe('en');
        });

        test('should detect vCard 3.0 version', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0]._originalVersion).toBe('3.0');
        });
    });

    describe('export', () => {
        test('should export contacts to VCF 4.0 format by default', () => {
            const contacts = [
                {
                    _id: 'id1',
                    fn: 'John Doe',
                    tels: ['+34612345678'],
                    emails: ['john@test.com'],
                    org: 'Test Company'
                }
            ];

            const output = VCFParser.export(contacts);

            expect(output).toContain('BEGIN:VCARD');
            expect(output).toContain('VERSION:4.0');
            expect(output).toContain('FN:John Doe');
            expect(output).toContain('TEL;TYPE=cell:+34612345678');
            expect(output).toContain('EMAIL:john@test.com');
            expect(output).toContain('ORG:Test Company');
            expect(output).toContain('END:VCARD');
        });

        test('should export contacts to VCF 3.0 format when specified', () => {
            const contacts = [
                {
                    _id: 'id1',
                    fn: 'John Doe',
                    tels: ['+34612345678'],
                    emails: ['john@test.com'],
                    org: 'Test Company'
                }
            ];

            const output = VCFParser.export(contacts, '3.0');

            expect(output).toContain('BEGIN:VCARD');
            expect(output).toContain('VERSION:3.0');
            expect(output).toContain('FN:John Doe');
            expect(output).toContain('TEL;TYPE=CELL:+34612345678');
            expect(output).toContain('EMAIL:john@test.com');
            expect(output).toContain('ORG:Test Company');
            expect(output).toContain('END:VCARD');
        });

        test('should handle multiple contacts', () => {
            const contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'Jane', tels: [], emails: [], org: '' }
            ];

            const output = VCFParser.export(contacts);
            const vcardCount = (output.match(/BEGIN:VCARD/g) || []).length;
            expect(vcardCount).toBe(2);
        });

        test('should include optional fields when present', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                title: 'CEO',
                adr: '123 Street',
                note: 'Important',
                url: 'https://test.com',
                bday: '1990-01-01'
            }];

            const output = VCFParser.export(contacts);
            expect(output).toContain('TITLE:CEO');
            expect(output).toContain('ADR:;;123 Street;;;;');
            expect(output).toContain('NOTE:Important');
            expect(output).toContain('URL:https://test.com');
            expect(output).toContain('BDAY:1990-01-01');
        });

        test('should include vCard 4.0 specific fields when version is 4.0', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                gender: 'M',
                anniversary: '2010-06-15',
                kind: 'individual',
                lang: 'en'
            }];

            const output = VCFParser.export(contacts, '4.0');
            expect(output).toContain('VERSION:4.0');
            expect(output).toContain('GENDER:M');
            expect(output).toContain('ANNIVERSARY:2010-06-15');
            expect(output).toContain('KIND:individual');
            expect(output).toContain('LANG:en');
        });

        test('should NOT include vCard 4.0 specific fields when version is 3.0', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                gender: 'M',
                anniversary: '2010-06-15',
                kind: 'individual',
                lang: 'en'
            }];

            const output = VCFParser.export(contacts, '3.0');
            expect(output).toContain('VERSION:3.0');
            expect(output).not.toContain('GENDER:');
            expect(output).not.toContain('ANNIVERSARY:');
            expect(output).not.toContain('KIND:');
            expect(output).not.toContain('LANG:');
        });
    });

    describe('hasLegacyVersionContacts', () => {
        test('should return true when contacts have version 3.0', () => {
            const contacts = [
                { _id: 'id1', fn: 'John', _originalVersion: '3.0', tels: [], emails: [], org: '' }
            ];
            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(true);
        });

        test('should return false when all contacts are version 4.0', () => {
            const contacts = [
                { _id: 'id1', fn: 'John', _originalVersion: '4.0', tels: [], emails: [], org: '' }
            ];
            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(false);
        });

        test('should return false when no version info is present', () => {
            const contacts = [
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ];
            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(false);
        });
    });

    describe('download', () => {
        test('should show warning toast when contacts list is empty', () => {
            VCFParser.download([]);
            expect(Toast.warning).toHaveBeenCalledWith(Config.messages.emptyList);
        });

        test('should create download link', () => {
            const appendSpy = vi.spyOn(document.body, 'appendChild');
            
            VCFParser.download([
                { _id: 'id1', fn: 'John', tels: [], emails: [], org: '' }
            ]);

            expect(appendSpy).toHaveBeenCalled();
            expect(URL.createObjectURL).toHaveBeenCalled();
        });
    });
});
