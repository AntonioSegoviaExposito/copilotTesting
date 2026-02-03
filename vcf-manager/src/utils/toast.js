/**
 * VCF Manager - Toast Notification System
 * 
 * PURPOSE: Styled toast notifications to replace native alert()/confirm()
 * DEPENDENCIES: Config
 * USED BY: All modules that need to show user notifications
 * 
 * This module provides:
 * - Non-blocking toast notifications (info, success, warning, error)
 * - Confirmation dialogs with promise-based API
 * - Auto-dismiss with configurable duration
 * - Multiple toasts can be shown simultaneously
 * - Accessible and user-friendly UI
 * 
 * DESIGN PRINCIPLES:
 * - Simple API matching alert()/confirm() for easy replacement
 * - Progressive enhancement: visual improvements without changing behavior
 * - Keyboard accessible (Escape to dismiss, Enter/Escape for confirms)
 * 
 * AI MAINTENANCE NOTES:
 * - Toast container is created on first use (lazy initialization)
 * - Toasts are automatically removed from DOM after animation completes
 * - Confirmation dialogs block interaction with overlay until resolved
 * - All animations done via CSS classes for performance
 * - Messages are HTML-escaped to prevent XSS attacks
 */

import Config from '../config.js';

/**
 * Escape HTML special characters to prevent XSS
 * @private
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML insertion
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Toast notification utility class
 * Provides styled notifications to replace alert() and confirm()
 */
class Toast {
    constructor() {
        /** @type {HTMLElement|null} Container for toast notifications */
        this.container = null;
        
        /** @type {number} Auto-dismiss duration in milliseconds */
        this.defaultDuration = 3000;
    }

    /**
     * Initialize toast container (lazy initialization)
     * Creates the container element on first use
     * @private
     * @returns {void}
     */
    _initContainer() {
        if (this.container) return;
        
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * Show a toast notification
     * 
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
     * @param {number} [duration] - Duration in ms (0 = no auto-dismiss)
     * @returns {void}
     * 
     * @example
     * Toast.show('Contact saved', 'success');
     * Toast.show('Error occurred', 'error', 5000);
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        this._initContainer();
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;
        
        // Add to container
        this.container.appendChild(toast);
        
        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this._removeToast(toast));
        
        // Auto-dismiss if duration > 0
        if (duration > 0) {
            setTimeout(() => this._removeToast(toast), duration);
        }
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });
    }

    /**
     * Remove a toast with animation
     * @private
     * @param {HTMLElement} toast - Toast element to remove
     * @returns {void}
     */
    _removeToast(toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Show info toast (blue)
     * @param {string} message - Message to display
     * @param {number} [duration] - Duration in ms
     * @returns {void}
     */
    info(message, duration) {
        this.show(message, 'info', duration);
    }

    /**
     * Show success toast (green)
     * @param {string} message - Message to display
     * @param {number} [duration] - Duration in ms
     * @returns {void}
     */
    success(message, duration) {
        this.show(message, 'success', duration);
    }

    /**
     * Show warning toast (orange)
     * @param {string} message - Message to display
     * @param {number} [duration] - Duration in ms
     * @returns {void}
     */
    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    /**
     * Show error toast (red)
     * @param {string} message - Message to display
     * @param {number} [duration] - Duration in ms
     * @returns {void}
     */
    error(message, duration) {
        this.show(message, 'error', duration);
    }

    /**
     * Show confirmation dialog (replacement for confirm())
     * 
     * Returns a Promise that resolves to true/false based on user choice
     * 
     * @param {string} message - Confirmation message
     * @param {string} [confirmText='Confirm'] - Text for confirm button
     * @param {string} [cancelText='Cancel'] - Text for cancel button
     * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
     * 
     * @example
     * const confirmed = await Toast.confirm('Delete contact?');
     * if (confirmed) {
     *   // delete contact
     * }
     */
    confirm(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'toast-confirm-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'toast-confirm-message');
            
            // Create dialog
            const dialog = document.createElement('div');
            dialog.className = 'toast-confirm-dialog';
            dialog.innerHTML = `
                <div class="toast-confirm-message" id="toast-confirm-message">${escapeHtml(message)}</div>
                <div class="toast-confirm-buttons">
                    <button class="btn btn-outline toast-confirm-cancel">${escapeHtml(cancelText)}</button>
                    <button class="btn btn-primary toast-confirm-ok">${escapeHtml(confirmText)}</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Handler for closing dialog
            const closeDialog = (result) => {
                overlay.classList.add('toast-confirm-hide');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 200);
                resolve(result);
            };
            
            // Button handlers
            const okBtn = dialog.querySelector('.toast-confirm-ok');
            const cancelBtn = dialog.querySelector('.toast-confirm-cancel');
            
            okBtn.addEventListener('click', () => closeDialog(true));
            cancelBtn.addEventListener('click', () => closeDialog(false));
            
            // Click outside to cancel
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeDialog(false);
                }
            });
            
            // Keyboard navigation
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    closeDialog(true);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDialog(false);
                }
            });
            
            // Show with animation
            requestAnimationFrame(() => {
                overlay.classList.add('toast-confirm-show');
                okBtn.focus();
            });
        });
    }
}

// Export singleton instance
export default new Toast();
