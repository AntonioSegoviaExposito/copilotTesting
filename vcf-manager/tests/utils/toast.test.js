/**
 * Toast Tests
 * Tests for toast notification system
 */
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import Toast from '../../src/utils/toast.js';

describe('Toast', () => {
    // Store original methods
    let originalShow, originalInfo, originalSuccess, originalWarning, originalError, originalConfirm;
    
    beforeEach(() => {
        // Save original methods (they were mocked in setup.js)
        originalShow = Toast.show;
        originalInfo = Toast.info;
        originalSuccess = Toast.success;
        originalWarning = Toast.warning;
        originalError = Toast.error;
        originalConfirm = Toast.confirm;
        
        // Restore real implementations for these tests
        Toast.show = Toast.constructor.prototype.show.bind(Toast);
        Toast.info = Toast.constructor.prototype.info.bind(Toast);
        Toast.success = Toast.constructor.prototype.success.bind(Toast);
        Toast.warning = Toast.constructor.prototype.warning.bind(Toast);
        Toast.error = Toast.constructor.prototype.error.bind(Toast);
        Toast.confirm = Toast.constructor.prototype.confirm.bind(Toast);
        
        // Reset container
        Toast.container = null;
        
        // Remove any existing toast container
        const existing = document.getElementById('toast-container');
        if (existing) existing.remove();
        
        vi.useFakeTimers();
    });

    afterEach(() => {
        // Restore mocked methods for other tests
        Toast.show = originalShow;
        Toast.info = originalInfo;
        Toast.success = originalSuccess;
        Toast.warning = originalWarning;
        Toast.error = originalError;
        Toast.confirm = originalConfirm;
        
        // Clean up DOM
        const container = document.getElementById('toast-container');
        if (container) container.remove();
        
        const overlay = document.querySelector('.toast-confirm-overlay');
        if (overlay) overlay.remove();
        
        vi.useRealTimers();
    });

    describe('Container initialization', () => {
        test('should lazily create container on first show', () => {
            expect(document.getElementById('toast-container')).toBeNull();
            
            Toast.show('Test message');
            
            expect(document.getElementById('toast-container')).not.toBeNull();
        });

        test('should reuse existing container on subsequent shows', () => {
            Toast.show('First message');
            const container1 = document.getElementById('toast-container');
            
            Toast.show('Second message');
            const container2 = document.getElementById('toast-container');
            
            expect(container1).toBe(container2);
        });
    });

    describe('show method', () => {
        test('should create toast element with correct structure', () => {
            Toast.show('Test message', 'info');
            
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.classList.contains('toast-info')).toBe(true);
            expect(toast.querySelector('.toast-icon')).not.toBeNull();
            expect(toast.querySelector('.toast-message').textContent).toBe('Test message');
            expect(toast.querySelector('.toast-close')).not.toBeNull();
        });

        test('should set correct accessibility attributes', () => {
            Toast.show('Accessible message');
            
            const toast = document.querySelector('.toast');
            expect(toast.getAttribute('role')).toBe('alert');
            expect(toast.getAttribute('aria-live')).toBe('polite');
        });

        test('should escape HTML in messages to prevent XSS', () => {
            Toast.show('<script>alert("xss")</script>');
            
            const message = document.querySelector('.toast-message');
            expect(message.innerHTML).not.toContain('<script>');
            expect(message.textContent).toContain('<script>');
        });

        test('should auto-dismiss after default duration', () => {
            Toast.show('Auto dismiss');
            
            expect(document.querySelectorAll('.toast').length).toBe(1);
            
            vi.advanceTimersByTime(3000); // Default duration
            vi.advanceTimersByTime(300); // Animation time
            
            expect(document.querySelectorAll('.toast').length).toBe(0);
        });

        test('should not auto-dismiss when duration is 0', () => {
            Toast.show('Persistent', 'info', 0);
            
            vi.advanceTimersByTime(10000);
            
            expect(document.querySelectorAll('.toast').length).toBe(1);
        });

        test('should remove toast when close button clicked', () => {
            Toast.show('Closeable');
            
            const closeBtn = document.querySelector('.toast-close');
            closeBtn.click();
            
            vi.advanceTimersByTime(300);
            
            expect(document.querySelectorAll('.toast').length).toBe(0);
        });
    });

    describe('Type-specific methods', () => {
        test('info should show info toast', () => {
            Toast.info('Info message');
            expect(document.querySelector('.toast-info')).not.toBeNull();
        });

        test('success should show success toast', () => {
            Toast.success('Success message');
            expect(document.querySelector('.toast-success')).not.toBeNull();
        });

        test('warning should show warning toast', () => {
            Toast.warning('Warning message');
            expect(document.querySelector('.toast-warning')).not.toBeNull();
        });

        test('error should show error toast', () => {
            Toast.error('Error message');
            expect(document.querySelector('.toast-error')).not.toBeNull();
        });
    });

    describe('Multiple toasts', () => {
        test('should show multiple toasts simultaneously', () => {
            Toast.info('First');
            Toast.success('Second');
            Toast.error('Third');
            
            expect(document.querySelectorAll('.toast').length).toBe(3);
        });
    });

    describe('confirm method', () => {
        test('should create overlay and dialog', async () => {
            const promise = Toast.confirm('Confirm this?');
            
            await vi.advanceTimersByTimeAsync(0);
            
            expect(document.querySelector('.toast-confirm-overlay')).not.toBeNull();
            expect(document.querySelector('.toast-confirm-dialog')).not.toBeNull();
            expect(document.querySelector('.toast-confirm-message').textContent).toBe('Confirm this?');
            
            // Clean up
            document.querySelector('.toast-confirm-ok').click();
            vi.advanceTimersByTime(200);
        });

        test('should resolve true when OK clicked', async () => {
            const promise = Toast.confirm('Confirm?');
            
            await vi.advanceTimersByTimeAsync(0);
            
            document.querySelector('.toast-confirm-ok').click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(true);
        });

        test('should resolve false when Cancel clicked', async () => {
            const promise = Toast.confirm('Cancel?');
            
            await vi.advanceTimersByTimeAsync(0);
            
            document.querySelector('.toast-confirm-cancel').click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should resolve false when clicking outside', async () => {
            const promise = Toast.confirm('Click outside?');
            
            await vi.advanceTimersByTimeAsync(0);
            
            const overlay = document.querySelector('.toast-confirm-overlay');
            overlay.click();
            vi.advanceTimersByTime(200);
            
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should use custom button text', async () => {
            const promise = Toast.confirm('Custom buttons?', 'Yes, do it', 'No, cancel');
            
            await vi.advanceTimersByTimeAsync(0);
            
            expect(document.querySelector('.toast-confirm-ok').textContent).toBe('Yes, do it');
            expect(document.querySelector('.toast-confirm-cancel').textContent).toBe('No, cancel');
            
            // Clean up
            document.querySelector('.toast-confirm-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should escape HTML in confirm message', async () => {
            const promise = Toast.confirm('<script>xss</script>');
            
            await vi.advanceTimersByTimeAsync(0);
            
            const message = document.querySelector('.toast-confirm-message');
            expect(message.innerHTML).not.toContain('<script>');
            
            // Clean up
            document.querySelector('.toast-confirm-cancel').click();
            vi.advanceTimersByTime(200);
        });

        test('should set correct accessibility attributes on dialog', async () => {
            const promise = Toast.confirm('Accessible dialog?');
            
            await vi.advanceTimersByTimeAsync(0);
            
            const overlay = document.querySelector('.toast-confirm-overlay');
            expect(overlay.getAttribute('role')).toBe('dialog');
            expect(overlay.getAttribute('aria-modal')).toBe('true');
            
            // Clean up
            document.querySelector('.toast-confirm-cancel').click();
            vi.advanceTimersByTime(200);
        });
    });
});
