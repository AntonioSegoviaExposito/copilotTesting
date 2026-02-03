/**
 * PhoneUtils Tests
 * Tests for phone number normalization and formatting
 */

describe('PhoneUtils', () => {
    describe('normalize', () => {
        test('should return empty string for empty input', () => {
            expect(PhoneUtils.normalize('')).toBe('');
            expect(PhoneUtils.normalize(null)).toBe('');
            expect(PhoneUtils.normalize(undefined)).toBe('');
        });

        test('should remove non-numeric characters except +', () => {
            expect(PhoneUtils.normalize('(123) 456-789')).toBe('+34123456789');
            expect(PhoneUtils.normalize('123.456.789')).toBe('+34123456789');
        });

        test('should convert 00 prefix to +', () => {
            expect(PhoneUtils.normalize('0034612345678')).toBe('+34612345678');
            expect(PhoneUtils.normalize('001415555678')).toBe('+1415555678');
            expect(PhoneUtils.normalize('0044207946095')).toBe('+44207946095');
        });

        test('should add +34 prefix for numbers without prefix', () => {
            expect(PhoneUtils.normalize('612345678')).toBe('+34612345678');
        });

        test('should preserve existing + prefix', () => {
            expect(PhoneUtils.normalize('+34612345678')).toBe('+34612345678');
            expect(PhoneUtils.normalize('+1234567890')).toBe('+1234567890');
            expect(PhoneUtils.normalize('+44791112345')).toBe('+44791112345');
        });

        test('should handle numbers with spaces', () => {
            expect(PhoneUtils.normalize('612 345 678')).toBe('+34612345678');
            expect(PhoneUtils.normalize('+1 415 555 1234')).toBe('+14155551234');
            expect(PhoneUtils.normalize('+44 7911 123456')).toBe('+447911123456');
        });

        test('should use custom default country code', () => {
            expect(PhoneUtils.normalize('612345678', '+1')).toBe('+1612345678');
            expect(PhoneUtils.normalize('791112345', '+44')).toBe('+44791112345');
        });

        test('should handle USA phone numbers', () => {
            expect(PhoneUtils.normalize('+1 415 555 1234')).toBe('+14155551234');
            expect(PhoneUtils.normalize('001 415 555 1234')).toBe('+14155551234');
            expect(PhoneUtils.normalize('(415) 555-1234', '+1')).toBe('+14155551234');
        });

        test('should handle UK phone numbers', () => {
            expect(PhoneUtils.normalize('+44 7911 123456')).toBe('+447911123456');
            expect(PhoneUtils.normalize('0044 20 7946 0958')).toBe('+442079460958');
            expect(PhoneUtils.normalize('+44 131 496 1234')).toBe('+441314961234');
        });

        test('should handle France phone numbers', () => {
            expect(PhoneUtils.normalize('+33 6 12 34 56 78')).toBe('+33612345678');
            expect(PhoneUtils.normalize('0033 1 23 45 67 89')).toBe('+33123456789');
        });

        test('should handle Germany phone numbers', () => {
            expect(PhoneUtils.normalize('+49 151 2345678')).toBe('+491512345678');
            expect(PhoneUtils.normalize('0049 30 12345678')).toBe('+493012345678');
            expect(PhoneUtils.normalize('+49 89 12345678')).toBe('+498912345678');
        });

        test('should be non-restrictive for short or invalid numbers', () => {
            expect(PhoneUtils.normalize('123')).toBe('123'); // Too short, kept as-is
            expect(PhoneUtils.normalize('ext 456')).toBe('456'); // Extension
        });
    });

    describe('format', () => {
        test('should format Spain (+34) phone numbers with spaces', () => {
            expect(PhoneUtils.format('+34612345678')).toBe('+34 612 345 678');
            expect(PhoneUtils.format('612345678')).toBe('+34 612 345 678');
        });

        test('should format USA (+1) phone numbers', () => {
            expect(PhoneUtils.format('+14155551234')).toBe('+1 415 555 1234');
            expect(PhoneUtils.format('001 415 555 1234')).toBe('+1 415 555 1234');
        });

        test('should format UK (+44) mobile numbers', () => {
            expect(PhoneUtils.format('+447911123456')).toBe('+44 7911 123456');
            expect(PhoneUtils.format('+447700900123')).toBe('+44 7700 900123');
        });

        test('should format UK (+44) landline numbers', () => {
            expect(PhoneUtils.format('+442079460958')).toBe('+44 20 7946 0958'); // London
        });

        test('should format France (+33) phone numbers', () => {
            expect(PhoneUtils.format('+33612345678')).toBe('+33 6 12 34 56 78');
            expect(PhoneUtils.format('+33123456789')).toBe('+33 1 23 45 67 89');
        });

        test('should format Germany (+49) mobile numbers', () => {
            expect(PhoneUtils.format('+4915123456789')).toBe('+49 151 23456789');
            expect(PhoneUtils.format('+4916012345678')).toBe('+49 160 12345678');
        });

        test('should format Germany (+49) landline numbers', () => {
            expect(PhoneUtils.format('+493012345678')).toBe('+49 30 12345678'); // Berlin
            expect(PhoneUtils.format('+498912345678')).toBe('+49 89 12345678'); // Munich
        });

        test('should return normalized format for unrecognized patterns', () => {
            expect(PhoneUtils.format('+9912345678')).toBe('+9912345678');
            expect(PhoneUtils.format('+85212345678')).toBe('+85212345678');
        });

        test('should handle empty input', () => {
            expect(PhoneUtils.format('')).toBe('');
        });

        test('should handle edge cases', () => {
            // Too short after cleaning
            expect(PhoneUtils.format('123')).toBe('123');
            // Invalid but kept as-is
            expect(PhoneUtils.format('abc')).toBe('');
        });
    });
});
