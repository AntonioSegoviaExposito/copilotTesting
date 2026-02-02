/**
 * PhoneUtils Edge Cases Tests
 * Additional tests for edge cases and boundary conditions
 */

describe('PhoneUtils - Edge Cases', () => {
    describe('normalize - Edge Cases', () => {
        test('should handle phone with only special characters', () => {
            expect(PhoneUtils.normalize('---')).toBe('');
        });

        test('should handle phone with multiple plus signs', () => {
            // Current implementation preserves multiple plus signs
            // This tests the actual behavior of the regex [^0-9+]
            expect(PhoneUtils.normalize('++34612345678')).toBe('++34612345678');
        });

        test('should handle very long phone number', () => {
            const longNumber = '0034' + '1'.repeat(20);
            const result = PhoneUtils.normalize(longNumber);
            expect(result.startsWith('+34')).toBe(true);
            expect(result.length).toBe(23); // +34 + 20 ones
        });

        test('should handle phone with mixed characters', () => {
            expect(PhoneUtils.normalize('abc+34-612.345(678)def')).toBe('+34612345678');
        });

        test('should handle international format with 00', () => {
            expect(PhoneUtils.normalize('0044123456789')).toBe('+44123456789');
        });

        test('should not add country code to short numbers', () => {
            expect(PhoneUtils.normalize('123')).toBe('123'); // Too short
        });

        test('should handle phone with whitespace only', () => {
            expect(PhoneUtils.normalize('   ')).toBe('');
        });

        test('should normalize phone with parentheses and dashes', () => {
            expect(PhoneUtils.normalize('(612) 345-678')).toBe('+34612345678');
        });

        test('should handle custom country code with different format', () => {
            expect(PhoneUtils.normalize('123456789', '+1')).toBe('+1123456789');
        });

        test('should preserve plus in middle of number', () => {
            // Current regex preserves all + characters anywhere in the string
            // This tests the actual behavior of [^0-9+] which keeps all plus signs
            expect(PhoneUtils.normalize('612+345678')).toBe('+34612+345678');
        });
    });

    describe('format - Edge Cases', () => {
        test('should handle already formatted number', () => {
            expect(PhoneUtils.format('+34 612 345 678')).toBe('+34 612 345 678');
        });

        test('should handle short +34 number', () => {
            expect(PhoneUtils.format('612')).toBe('612'); // Too short, no +34 added
        });

        test('should handle +34 number with extra digits', () => {
            expect(PhoneUtils.format('+346123456789')).toBe('+346123456789'); // 13 chars, not formatted
        });

        test('should not format non-Spanish numbers with extra length', () => {
            expect(PhoneUtils.format('+441234567890')).toBe('+441234567890');
        });

        test('should handle empty after normalization', () => {
            expect(PhoneUtils.format('---')).toBe('');
        });

        test('should format valid 9-digit Spanish number', () => {
            expect(PhoneUtils.format('612345678')).toBe('+34 612 345 678');
        });

        test('should handle international format without spaces', () => {
            expect(PhoneUtils.format('+34612345678')).toBe('+34 612 345 678');
        });

        test('should not format +34 numbers with wrong length', () => {
            expect(PhoneUtils.format('+3461234567')).toBe('+3461234567'); // 11 chars
        });
    });

    describe('Integration - normalize and format together', () => {
        test('should normalize then format correctly', () => {
            const input = '612 345 678';
            const normalized = PhoneUtils.normalize(input);
            const formatted = PhoneUtils.format(normalized);
            expect(formatted).toBe('+34 612 345 678');
        });

        test('should handle full cycle with international prefix', () => {
            const input = '0034 612 345 678';
            const normalized = PhoneUtils.normalize(input);
            expect(normalized).toBe('+34612345678');
            const formatted = PhoneUtils.format(normalized);
            expect(formatted).toBe('+34 612 345 678');
        });

        test('should handle non-Spanish number through full cycle', () => {
            const input = '+44 123 456 789';
            const normalized = PhoneUtils.normalize(input);
            expect(normalized).toBe('+44123456789');
            const formatted = PhoneUtils.format(normalized);
            expect(formatted).toBe('+44123456789'); // No special formatting
        });
    });
});