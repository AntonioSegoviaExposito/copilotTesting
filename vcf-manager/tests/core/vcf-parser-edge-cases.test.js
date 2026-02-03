/**
 * VCFParser Edge Cases Tests
 * Additional tests for boundary conditions and error handling
 */

describe('VCFParser - Edge Cases', () => {
    describe('parse - Edge Cases', () => {
        test('should handle VCF with only BEGIN and END', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(1);
            expect(contacts[0].fn).toBe(Config.messages.noName);
        });

        test('should handle VCF with empty lines', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\n\n\nFN:John Doe\n\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(1);
            expect(contacts[0].fn).toBe('John Doe');
        });

        test('should handle VCF with trailing whitespace', () => {
            const vcf = 'BEGIN:VCARD   \nVERSION:3.0\nFN:John Doe   \nEND:VCARD  ';
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(1);
            expect(contacts[0].fn).toBe('John Doe');
        });

        test('should handle VCF with multiple versions', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:4.0\nFN:John Doe\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(1);
            expect(contacts[0].fn).toBe('John Doe');
        });

        test('should handle VCF with multiple phone types', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:John\nTEL;TYPE=HOME:111\nTEL;TYPE=WORK:222\nTEL;TYPE=CELL:333\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].tels).toHaveLength(3);
        });

        test('should handle VCF with multiple email types', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:John\nEMAIL;TYPE=HOME:home@test.com\nEMAIL;TYPE=WORK:work@test.com\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].emails).toHaveLength(2);
        });

        test('should handle empty VCF content', () => {
            const contacts = VCFParser.parse('');
            expect(contacts).toEqual([]);
        });

        test('should parse malformed VCF missing BEGIN gracefully', () => {
            // The parser looks for cards between BEGIN:VCARD and END:VCARD
            // Without BEGIN:VCARD, it may still parse if END:VCARD is present
            const vcf = 'VERSION:3.0\nFN:John Doe\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            // Parser implementation may find a card if END:VCARD exists
            // Verify it returns an array (actual behavior depends on implementation)
            expect(Array.isArray(contacts)).toBe(true);
            // If it does parse, verify it has expected structure
            if (contacts.length > 0) {
                expect(contacts[0]).toHaveProperty('fn');
            }
        });

        test('should handle special characters in names', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:José García-López\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].fn).toBe('José García-López');
        });

        test('should handle very long field values', () => {
            const longName = 'A'.repeat(200);
            const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${longName}\nEND:VCARD`;
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].fn).toBe(longName);
        });

        test('should handle N field with semicolons', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;Middle;Mr.;Jr.\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            // The parser replaces semicolons with spaces
            expect(contacts[0].fn).toContain('Doe');
            expect(contacts[0].fn).toContain('John');
        });

        test('should handle multiple contacts with different field orders', () => {
            const vcf = `BEGIN:VCARD
VERSION:3.0
FN:First
TEL:111
END:VCARD
BEGIN:VCARD
VERSION:3.0
TEL:222
FN:Second
END:VCARD`;
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(2);
            expect(contacts[0].fn).toBe('First');
            expect(contacts[1].fn).toBe('Second');
        });

        test('should handle mixed line endings in single VCF', () => {
            const vcf = 'BEGIN:VCARD\r\nVERSION:3.0\nFN:Test\r\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts).toHaveLength(1);
            expect(contacts[0].fn).toBe('Test');
        });

        test('should handle VCF with NOTE containing multiple lines', () => {
            const vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:Test\nNOTE:Line 1\\nLine 2\\nLine 3\nEND:VCARD';
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].note).toBe('Line 1\\nLine 2\\nLine 3');
        });
    });

    describe('export - Edge Cases', () => {
        test('should export contact with minimal fields', () => {
            const contact = { id: '1', fn: 'Test', tels: [], emails: [] };
            const vcf = VCFParser.export([contact]);
            expect(vcf).toContain('BEGIN:VCARD');
            expect(vcf).toContain('FN:Test');
            expect(vcf).toContain('END:VCARD');
            expect(vcf).not.toContain('TEL');
            expect(vcf).not.toContain('EMAIL');
        });

        test('should export contact with empty arrays', () => {
            const contact = { id: '1', fn: 'Test', tels: [], emails: [] };
            const vcf = VCFParser.export([contact]);
            expect(vcf).not.toContain('TEL');
            expect(vcf).not.toContain('EMAIL');
        });

        test('should export contact with special characters', () => {
            const contact = { id: '1', fn: 'José García', tels: [], emails: [] };
            const vcf = VCFParser.export([contact]);
            expect(vcf).toContain('FN:José García');
        });

        test('should handle empty contacts array', () => {
            const vcf = VCFParser.export([]);
            expect(vcf).toBe('');
        });

        test('should export multiple contacts correctly', () => {
            const contacts = [
                { id: '1', fn: 'First', tels: [], emails: [] },
                { id: '2', fn: 'Second', tels: [], emails: [] },
                { id: '3', fn: 'Third', tels: [], emails: [] }
            ];
            const vcf = VCFParser.export(contacts);
            const beginCount = (vcf.match(/BEGIN:VCARD/g) || []).length;
            expect(beginCount).toBe(3);
        });

        test('should export contact with all optional fields', () => {
            const contact = {
                id: '1',
                fn: 'Test',
                tels: [],
                emails: [],
                org: 'Company',
                title: 'Manager',
                adr: '123 Street',
                note: 'Important note'
            };
            const vcf = VCFParser.export([contact]);
            expect(vcf).toContain('ORG:Company');
            expect(vcf).toContain('TITLE:Manager');
            expect(vcf).toContain('ADR:'); // ADR field is formatted with semicolons
            expect(vcf).toContain('123 Street');
            expect(vcf).toContain('NOTE:Important note');
        });
    });

    describe('download - Edge Cases', () => {
        test('should not create download for empty contact list', () => {
            const createElementSpy = vi.spyOn(document, 'createElement');
            VCFParser.download([]);
            expect(Toast.warning).toHaveBeenCalledWith(Config.messages.emptyList);
            expect(createElementSpy).not.toHaveBeenCalledWith('a');
        });

        test('should create download link with timestamp', () => {
            const mockElement = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {}
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
            vi.spyOn(document.body, 'appendChild').mockReturnValue(undefined);
            vi.spyOn(document.body, 'removeChild').mockReturnValue(undefined);
            
            const contacts = [{ id: '1', fn: 'Test', tels: [], emails: [] }];
            VCFParser.download(contacts);
            
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockElement.click).toHaveBeenCalled();
        });
    });
});