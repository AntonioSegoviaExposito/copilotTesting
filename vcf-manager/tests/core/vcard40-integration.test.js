/**
 * vCard 4.0 Integration Tests
 * Tests for vCard 4.0 features including new fields and version detection
 */

import { describe, test, expect, beforeEach } from 'vitest';
import VCFParser from '../../src/core/vcf-parser.js';
import Config from '../../src/config.js';

describe('vCard 4.0 Integration Tests', () => {
    describe('Version Detection and Parsing', () => {
        test('should detect vCard 4.0 version', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Test User
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0]._originalVersion).toBe('4.0');
        });

        test('should detect vCard 3.0 version', () => {
            const vcf = `BEGIN:VCARD
VERSION:3.0
FN:Test User
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0]._originalVersion).toBe('3.0');
        });

        test('should default to 3.0 when no version specified', () => {
            const vcf = `BEGIN:VCARD
FN:Test User
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0]._originalVersion).toBe('3.0');
        });
    });

    describe('vCard 4.0 New Fields', () => {
        test('should parse GENDER field', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Test User
GENDER:F
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].gender).toBe('F');
        });

        test('should parse ANNIVERSARY field', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Test User
ANNIVERSARY:2015-06-20
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].anniversary).toBe('2015-06-20');
        });

        test('should parse KIND field', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Engineering Team
KIND:group
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].kind).toBe('group');
        });

        test('should parse LANG field', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Test User
LANG:es
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].lang).toBe('es');
        });

        test('should parse all vCard 4.0 fields together', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Maria García
GENDER:F
ANNIVERSARY:2015-06-20
KIND:individual
LANG:es
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].gender).toBe('F');
            expect(contacts[0].anniversary).toBe('2015-06-20');
            expect(contacts[0].kind).toBe('individual');
            expect(contacts[0].lang).toBe('es');
        });
    });

    describe('Export with Version Selection', () => {
        test('should export vCard 4.0 with all new fields', () => {
            const contacts = [{
                _id: 'test1',
                fn: 'Maria García',
                tels: ['+34612345678'],
                emails: ['maria@example.com'],
                org: 'TechCorp',
                gender: 'F',
                anniversary: '2015-06-20',
                kind: 'individual',
                lang: 'es'
            }];

            const vcf = VCFParser.export(contacts, '4.0');
            
            expect(vcf).toContain('VERSION:4.0');
            expect(vcf).toContain('GENDER:F');
            expect(vcf).toContain('ANNIVERSARY:2015-06-20');
            expect(vcf).toContain('KIND:individual');
            expect(vcf).toContain('LANG:es');
        });

        test('should use lowercase TYPE for TEL in vCard 4.0', () => {
            const contacts = [{
                _id: 'test1',
                fn: 'Test User',
                tels: ['+34612345678'],
                emails: [],
                org: ''
            }];

            const vcf = VCFParser.export(contacts, '4.0');
            expect(vcf).toContain('TEL;TYPE=cell:');
        });

        test('should use uppercase TYPE for TEL in vCard 3.0', () => {
            const contacts = [{
                _id: 'test1',
                fn: 'Test User',
                tels: ['+34612345678'],
                emails: [],
                org: ''
            }];

            const vcf = VCFParser.export(contacts, '3.0');
            expect(vcf).toContain('TEL;TYPE=CELL:');
        });

        test('should NOT export vCard 4.0 fields in 3.0 format', () => {
            const contacts = [{
                _id: 'test1',
                fn: 'Test User',
                tels: [],
                emails: [],
                org: '',
                gender: 'M',
                anniversary: '2010-01-01',
                kind: 'individual',
                lang: 'en'
            }];

            const vcf = VCFParser.export(contacts, '3.0');
            
            expect(vcf).toContain('VERSION:3.0');
            expect(vcf).not.toContain('GENDER:');
            expect(vcf).not.toContain('ANNIVERSARY:');
            expect(vcf).not.toContain('KIND:');
            expect(vcf).not.toContain('LANG:');
        });
    });

    describe('Round-trip Conversion', () => {
        test('should preserve vCard 4.0 data in round-trip', () => {
            const originalVcf = `BEGIN:VCARD
VERSION:4.0
FN:Test User
TEL;TYPE=cell:+34612345678
EMAIL:test@example.com
ORG:TestOrg
GENDER:M
ANNIVERSARY:2010-05-15
KIND:individual
LANG:en
END:VCARD`;

            const contacts = VCFParser.parse(originalVcf);
            const exportedVcf = VCFParser.export(contacts, '4.0');
            
            expect(exportedVcf).toContain('VERSION:4.0');
            expect(exportedVcf).toContain('FN:Test User');
            expect(exportedVcf).toContain('GENDER:M');
            expect(exportedVcf).toContain('ANNIVERSARY:2010-05-15');
            expect(exportedVcf).toContain('KIND:individual');
            expect(exportedVcf).toContain('LANG:en');
        });

        test('should handle vCard 3.0 import and 4.0 export (upgrade)', () => {
            const v3Vcf = `BEGIN:VCARD
VERSION:3.0
FN:Test User
TEL;TYPE=CELL:+34612345678
EMAIL:test@example.com
ORG:TestOrg
END:VCARD`;

            const contacts = VCFParser.parse(v3Vcf);
            expect(contacts[0]._originalVersion).toBe('3.0');
            
            const v4Vcf = VCFParser.export(contacts, '4.0');
            expect(v4Vcf).toContain('VERSION:4.0');
            expect(v4Vcf).toContain('FN:Test User');
        });
    });

    describe('Legacy Version Detection', () => {
        test('should detect legacy contacts correctly', () => {
            const contacts = [
                { _id: 'id1', fn: 'User 1', _originalVersion: '3.0', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'User 2', _originalVersion: '4.0', tels: [], emails: [], org: '' }
            ];

            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(true);
        });

        test('should return false when all contacts are v4.0', () => {
            const contacts = [
                { _id: 'id1', fn: 'User 1', _originalVersion: '4.0', tels: [], emails: [], org: '' },
                { _id: 'id2', fn: 'User 2', _originalVersion: '4.0', tels: [], emails: [], org: '' }
            ];

            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(false);
        });

        test('should return false when no version info', () => {
            const contacts = [
                { _id: 'id1', fn: 'User 1', tels: [], emails: [], org: '' }
            ];

            expect(VCFParser.hasLegacyVersionContacts(contacts)).toBe(false);
        });
    });

    describe('KIND Field Values', () => {
        test('should support individual kind', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Person Name
KIND:individual
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].kind).toBe('individual');
        });

        test('should support group kind', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Team Name
KIND:group
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].kind).toBe('group');
        });

        test('should support org kind', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Company Name
KIND:org
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].kind).toBe('org');
        });

        test('should support location kind', () => {
            const vcf = `BEGIN:VCARD
VERSION:4.0
FN:Office Building
KIND:location
END:VCARD`;
            
            const contacts = VCFParser.parse(vcf);
            expect(contacts[0].kind).toBe('location');
        });
    });

    describe('Default Version Configuration', () => {
        test('should have default version configured as 4.0', () => {
            expect(Config.vcard.defaultVersion).toBe('4.0');
        });

        test('should export as v4.0 when no version specified', () => {
            const contacts = [{
                _id: 'test1',
                fn: 'Test User',
                tels: [],
                emails: [],
                org: ''
            }];

            const vcf = VCFParser.export(contacts);
            expect(vcf).toContain('VERSION:4.0');
        });
    });
});
