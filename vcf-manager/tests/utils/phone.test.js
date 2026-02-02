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
        });

        test('should add +34 prefix for numbers without prefix', () => {
            expect(PhoneUtils.normalize('612345678')).toBe('+34612345678');
        });

        test('should preserve existing + prefix', () => {
            expect(PhoneUtils.normalize('+34612345678')).toBe('+34612345678');
            expect(PhoneUtils.normalize('+1234567890')).toBe('+1234567890');
        });

        test('should handle numbers with spaces', () => {
            expect(PhoneUtils.normalize('612 345 678')).toBe('+34612345678');
        });

        test('should use custom default country code', () => {
            expect(PhoneUtils.normalize('612345678', '+1')).toBe('+1612345678');
        });
    });

    describe('format', () => {
        test('should format phone numbers with +34 country code with spaces', () => {
            expect(PhoneUtils.format('+34612345678')).toBe('+34 612 345 678');
            expect(PhoneUtils.format('612345678')).toBe('+34 612 345 678');
        });

        test('should return normalized phone for other country codes', () => {
            expect(PhoneUtils.format('+1234567890')).toBe('+1234567890');
        });

        test('should handle empty input', () => {
            expect(PhoneUtils.format('')).toBe('');
        });
    });
});
