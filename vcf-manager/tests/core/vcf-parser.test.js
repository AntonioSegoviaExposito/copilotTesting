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
        
        test('should parse v4.0 specific fields', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:4.0
FN:Juan Carlos Pérez
GENDER:M
KIND:individual
ANNIVERSARY:2010-07-23
LANG:es
GEO:geo:37.386013,-5.992425
TZ:Europe/Madrid
NICKNAME:Juancar
CATEGORIES:Developer,Remote
ROLE:Software Architect
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].fn).toBe('Juan Carlos Pérez');
            expect(contacts[0].gender).toBe('M');
            expect(contacts[0].kind).toBe('individual');
            expect(contacts[0].anniversary).toBe('2010-07-23');
            expect(contacts[0].lang).toBe('es');
            expect(contacts[0].geo).toBe('geo:37.386013,-5.992425');
            expect(contacts[0].tz).toBe('Europe/Madrid');
            expect(contacts[0].nickname).toBe('Juancar');
            expect(contacts[0].categories).toBe('Developer,Remote');
            expect(contacts[0].role).toBe('Software Architect');
        });
        
        test('should parse PHOTO field', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
PHOTO:https://example.com/photo.jpg
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].photo).toBe('https://example.com/photo.jpg');
        });
        
        test('should parse PHOTO with data URI', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
PHOTO:data:image/jpeg;base64,/9j/4AAQSkZJRg==
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].photo).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
        });
        
        test('should parse multiple IMPP addresses', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:4.0
FN:John Doe
IMPP:xmpp:john@jabber.org
IMPP:sip:john@example.com
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts[0].impp).toContain('xmpp:john@jabber.org');
            expect(contacts[0].impp).toContain('sip:john@example.com');
        });
        
        test('should parse v2.1 vCard as v4.0 compatible', () => {
            const vcfContent = `BEGIN:VCARD
VERSION:2.1
FN:John Doe
TEL:612345678
EMAIL:john@example.com
END:VCARD`;

            const contacts = VCFParser.parse(vcfContent);
            expect(contacts.length).toBe(1);
            expect(contacts[0].fn).toBe('John Doe');
            expect(contacts[0].tels).toContain('612345678');
            expect(contacts[0].emails).toContain('john@example.com');
            // v2.1 will have undefined v4.0-specific fields
            expect(contacts[0].gender).toBeUndefined();
            expect(contacts[0].kind).toBeUndefined();
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
            expect(output).toContain('VERSION:4.0');
            expect(output).toContain('FN:John Doe');
            expect(output).toContain('TEL;TYPE=cell,voice;VALUE=uri:tel:+34612345678');
            expect(output).toContain('EMAIL;TYPE=internet:john@test.com');
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
        
        test('should include v4.0 specific fields when present', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John Doe',
                tels: [],
                emails: [],
                org: '',
                gender: 'M',
                kind: 'individual',
                anniversary: '2010-07-23',
                lang: 'es',
                geo: 'geo:37.386013,-5.992425',
                tz: 'Europe/Madrid',
                nickname: 'Johnny',
                categories: 'Developer,Remote',
                role: 'Software Architect'
            }];

            const output = VCFParser.export(contacts);
            expect(output).toContain('VERSION:4.0');
            expect(output).toContain('GENDER:M');
            expect(output).toContain('KIND:individual');
            expect(output).toContain('ANNIVERSARY:2010-07-23');
            expect(output).toContain('LANG:es');
            expect(output).toContain('GEO:geo:37.386013,-5.992425');
            expect(output).toContain('TZ:Europe/Madrid');
            expect(output).toContain('NICKNAME:Johnny');
            expect(output).toContain('CATEGORIES:Developer,Remote');
            expect(output).toContain('ROLE:Software Architect');
        });
        
        test('should handle PHOTO with data URI', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
            }];

            const output = VCFParser.export(contacts);
            expect(output).toContain('PHOTO:data:image/jpeg;base64,/9j/4AAQSkZJRg==');
        });
        
        test('should handle PHOTO with URL and MEDIATYPE', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                photo: 'https://example.com/photo.jpg'
            }];

            const output = VCFParser.export(contacts);
            expect(output).toContain('PHOTO;MEDIATYPE=image/jpeg:https://example.com/photo.jpg');
        });
        
        test('should handle multiple IMPP addresses', () => {
            const contacts = [{
                _id: 'id1',
                fn: 'John',
                tels: [],
                emails: [],
                org: '',
                impp: ['xmpp:john@jabber.org', 'sip:john@example.com']
            }];

            const output = VCFParser.export(contacts);
            expect(output).toContain('IMPP:xmpp:john@jabber.org');
            expect(output).toContain('IMPP:sip:john@example.com');
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
