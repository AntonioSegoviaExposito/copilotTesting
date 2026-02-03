/**
 * DuplicatePreview Tests
 * Tests for duplicate preview modal functionality
 */
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import DuplicatePreview from '../../src/features/duplicate-preview.js';

describe('DuplicatePreview', () => {
    // Store original show method
    let originalShow;
    
    beforeEach(() => {
        // Save original method (it was mocked in setup.js)
        originalShow = DuplicatePreview.show;
        
        // Restore real implementation for these tests
        DuplicatePreview.show = DuplicatePreview.constructor.prototype.show.bind(DuplicatePreview);
        DuplicatePreview._createModal = DuplicatePreview.constructor.prototype._createModal.bind(DuplicatePreview);
        DuplicatePreview._renderGroups = DuplicatePreview.constructor.prototype._renderGroups.bind(DuplicatePreview);
        
        // Reset modal reference
        DuplicatePreview.modal = null;
        
        vi.useFakeTimers();
    });

    afterEach(() => {
        // Restore mocked method for other tests
        DuplicatePreview.show = originalShow;
        
        // Clean up DOM
        const overlay = document.querySelector('.duplicate-preview-overlay');
        if (overlay) overlay.remove();
        
        vi.useRealTimers();
    });

    describe('show method', () => {
        test('should return a Promise', () => {
            const groups = [[{ _id: '1', fn: 'John', tels: [] }]];
            const result = DuplicatePreview.show(groups, 'name');
            
            expect(result).toBeInstanceOf(Promise);
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel')?.click();
            vi.advanceTimersByTime(200);
        });

        test('should create overlay and dialog', async () => {
            const groups = [[
                { _id: '1', fn: 'John', tels: ['123'] },
                { _id: '2', fn: 'John', tels: ['456'] }
            ]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            expect(document.querySelector('.duplicate-preview-overlay')).not.toBeNull();
            expect(document.querySelector('.duplicate-preview-dialog')).not.toBeNull();
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should set correct accessibility attributes', async () => {
            const groups = [[{ _id: '1', fn: 'Test', tels: [] }, { _id: '2', fn: 'Test', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const overlay = document.querySelector('.duplicate-preview-overlay');
            expect(overlay.getAttribute('role')).toBe('dialog');
            expect(overlay.getAttribute('aria-modal')).toBe('true');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });
    });

    describe('Summary display', () => {
        test('should show correct group count', async () => {
            const groups = [
                [{ _id: '1', fn: 'John', tels: [] }, { _id: '2', fn: 'John', tels: [] }],
                [{ _id: '3', fn: 'Jane', tels: [] }, { _id: '4', fn: 'Jane', tels: [] }]
            ];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const statValues = document.querySelectorAll('.duplicate-preview-stat-value');
            expect(statValues[0].textContent).toBe('2'); // 2 groups
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should show correct total contact count', async () => {
            const groups = [
                [{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }, { _id: '3', fn: 'A', tels: [] }],
                [{ _id: '4', fn: 'B', tels: [] }, { _id: '5', fn: 'B', tels: [] }]
            ];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const statValues = document.querySelectorAll('.duplicate-preview-stat-value');
            expect(statValues[1].textContent).toBe('5'); // 5 total contacts
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should show detection mode for name', async () => {
            const groups = [[{ _id: '1', fn: 'Test', tels: [] }, { _id: '2', fn: 'Test', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const mode = document.querySelector('.duplicate-preview-mode');
            expect(mode.textContent).toContain('nombre');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should show detection mode for phone', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: ['123'] }, { _id: '2', fn: 'B', tels: ['123'] }]];
            
            const promise = DuplicatePreview.show(groups, 'phone');
            await vi.advanceTimersByTimeAsync(0);
            
            const mode = document.querySelector('.duplicate-preview-mode');
            expect(mode.textContent).toContain('teléfono');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });
    });

    describe('Groups rendering', () => {
        test('should render all groups', async () => {
            const groups = [
                [{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }],
                [{ _id: '3', fn: 'B', tels: [] }, { _id: '4', fn: 'B', tels: [] }],
                [{ _id: '5', fn: 'C', tels: [] }, { _id: '6', fn: 'C', tels: [] }]
            ];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const renderedGroups = document.querySelectorAll('.duplicate-preview-group');
            expect(renderedGroups.length).toBe(3);
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should show contact names in groups', async () => {
            const groups = [[
                { _id: '1', fn: 'John Doe', tels: [] },
                { _id: '2', fn: 'John D.', tels: [] }
            ]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const contacts = document.querySelectorAll('.duplicate-preview-contact');
            expect(contacts[0].textContent).toContain('John Doe');
            expect(contacts[1].textContent).toContain('John D.');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should show phone numbers when available', async () => {
            const groups = [[
                { _id: '1', fn: 'Test', tels: ['+34612345678'] },
                { _id: '2', fn: 'Test', tels: ['+34698765432'] }
            ]];
            
            const promise = DuplicatePreview.show(groups, 'phone');
            await vi.advanceTimersByTimeAsync(0);
            
            const phones = document.querySelectorAll('.duplicate-preview-phone');
            expect(phones[0].textContent).toBe('+34612345678');
            expect(phones[1].textContent).toBe('+34698765432');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should escape HTML in contact names', async () => {
            const groups = [[
                { _id: '1', fn: '<script>xss</script>', tels: [] },
                { _id: '2', fn: 'Normal', tels: [] }
            ]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const contacts = document.querySelectorAll('.duplicate-preview-contact');
            expect(contacts[0].innerHTML).not.toContain('<script>');
            expect(contacts[0].textContent).toContain('<script>');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should handle contacts without name', async () => {
            const groups = [[
                { _id: '1', fn: '', tels: ['123'] },
                { _id: '2', fn: 'Test', tels: [] }
            ]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const contacts = document.querySelectorAll('.duplicate-preview-contact');
            expect(contacts[0].textContent).toContain('Sin nombre');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });
    });

    describe('User interactions', () => {
        test('should resolve true when Continue clicked', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            document.querySelector('.duplicate-preview-continue').click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(true);
        });

        test('should resolve false when Cancel clicked', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should resolve false when close button clicked', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            document.querySelector('.duplicate-preview-close').click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should resolve false when clicking outside dialog', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const overlay = document.querySelector('.duplicate-preview-overlay');
            overlay.click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should remove modal from DOM after closing', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            expect(document.querySelector('.duplicate-preview-overlay')).not.toBeNull();
            
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
            
            await promise;
            
            expect(document.querySelector('.duplicate-preview-overlay')).toBeNull();
        });
    });

    describe('Group count labels', () => {
        test('should use singular for 1 group', async () => {
            const groups = [[{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }]];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const labels = document.querySelectorAll('.duplicate-preview-stat-label');
            expect(labels[0].textContent).toBe('Grupo');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should use plural for multiple groups', async () => {
            const groups = [
                [{ _id: '1', fn: 'A', tels: [] }, { _id: '2', fn: 'A', tels: [] }],
                [{ _id: '3', fn: 'B', tels: [] }, { _id: '4', fn: 'B', tels: [] }]
            ];
            
            const promise = DuplicatePreview.show(groups, 'name');
            await vi.advanceTimersByTimeAsync(0);
            
            const labels = document.querySelectorAll('.duplicate-preview-stat-label');
            expect(labels[0].textContent).toBe('Grupos');
            
            // Clean up
            document.querySelector('.duplicate-preview-cancel').click();
            vi.advanceTimersByTime(200);
        });
    });
});
