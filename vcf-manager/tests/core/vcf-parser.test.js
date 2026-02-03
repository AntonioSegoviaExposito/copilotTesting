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
    });

    describe('export', () => {
        test('should export contacts to VCF format', () => {
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
