/**
 * VCF Manager - Duplicate Preview Module
 * 
 * PURPOSE: Preview duplicate contacts before starting auto-merge
 * DEPENDENCIES: Config, Toast
 * USED BY: AutoMerger (before starting merge workflow)
 * 
 * This module provides:
 * - Visual preview of duplicate groups
 * - Count and details of duplicates found
 * - User-friendly confirmation dialog
 * - Cancel/Continue options
 * 
 * DESIGN PRINCIPLES:
 * - Show user what will be merged before committing
 * - Clear and informative UI
 * - Easy to understand grouping
 * - Non-blocking and accessible
 * 
 * AI MAINTENANCE NOTES:
 * - Modal is created on first use (lazy initialization)
 * - Returns a Promise that resolves to true (continue) or false (cancel)
 * - Displays groups with contact names for easy identification
 * - Auto-scrolls if many groups exist
 * - HTML content is escaped to prevent XSS attacks
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
 * Duplicate Preview utility class
 * Shows a preview of duplicate groups before auto-merge
 */
class DuplicatePreview {
    constructor() {
        /** @type {HTMLElement|null} Modal overlay element */
        this.modal = null;
    }

    /**
     * Show preview of duplicate groups and get user confirmation
     * 
     * @param {Array<Array<Object>>} groups - Array of duplicate contact groups
     * @param {string} mode - Detection mode: 'name' or 'phone'
     * @returns {Promise<boolean>} Resolves to true if user continues, false if cancelled
     * 
     * @example
     * const groups = [
     *   [{fn: 'John', _id: '1'}, {fn: 'John', _id: '2'}],
     *   [{fn: 'Jane', _id: '3'}, {fn: 'Jane', _id: '4'}]
     * ];
     * const shouldContinue = await DuplicatePreview.show(groups, 'name');
     */
    show(groups, mode) {
        return new Promise((resolve) => {
            this._createModal(groups, mode, resolve);
        });
    }

    /**
     * Create and show the preview modal
     * @private
     */
    _createModal(groups, mode, resolve) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'duplicate-preview-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'duplicate-preview-title');
        
        // Count total duplicates
        const totalDuplicates = groups.reduce((sum, group) => sum + group.length, 0);
        const groupCount = groups.length;
        
        // Detection mode label
        const modeLabel = mode === 'name' ? 'por nombre' : 'por teléfono';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'duplicate-preview-dialog';
        dialog.innerHTML = `
            <div class="duplicate-preview-header">
                <h3 id="duplicate-preview-title" style="margin:0; color: var(--text)">
                    🔍 Vista previa de duplicados
                </h3>
                <button class="duplicate-preview-close" aria-label="Cerrar" title="Cerrar">×</button>
            </div>
            
            <div class="duplicate-preview-body">
                <div class="duplicate-preview-summary">
                    <div class="duplicate-preview-stat">
                        <div class="duplicate-preview-stat-value">${groupCount}</div>
                        <div class="duplicate-preview-stat-label">${groupCount === 1 ? 'Grupo' : 'Grupos'}</div>
                    </div>
                    <div class="duplicate-preview-stat">
                        <div class="duplicate-preview-stat-value">${totalDuplicates}</div>
                        <div class="duplicate-preview-stat-label">${totalDuplicates === 1 ? 'Contacto' : 'Contactos'}</div>
                    </div>
                    <div class="duplicate-preview-mode">
                        Detección ${modeLabel}
                    </div>
                </div>
                
                <div class="duplicate-preview-info">
                    Se encontraron <strong>${groupCount}</strong> ${groupCount === 1 ? 'grupo' : 'grupos'} de duplicados 
                    con un total de <strong>${totalDuplicates}</strong> contactos. 
                    A continuación se muestran los grupos que serán combinados:
                </div>
                
                <div class="duplicate-preview-groups">
                    ${this._renderGroups(groups)}
                </div>
            </div>
            
            <div class="duplicate-preview-footer">
                <button class="btn btn-outline duplicate-preview-cancel">
                    ❌ Cancelar
                </button>
                <button class="btn btn-primary duplicate-preview-continue">
                    ✅ Continuar con la fusión
                </button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Store reference for cleanup
        this.modal = overlay;
        
        // Handler for closing dialog
        const closeDialog = (result) => {
            overlay.classList.add('duplicate-preview-hide');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                this.modal = null;
            }, 200);
            resolve(result);
        };
        
        // Button handlers
        const continueBtn = dialog.querySelector('.duplicate-preview-continue');
        const cancelBtn = dialog.querySelector('.duplicate-preview-cancel');
        const closeBtn = dialog.querySelector('.duplicate-preview-close');
        
        continueBtn.addEventListener('click', () => closeDialog(true));
        cancelBtn.addEventListener('click', () => closeDialog(false));
        closeBtn.addEventListener('click', () => closeDialog(false));
        
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
            overlay.classList.add('duplicate-preview-show');
            continueBtn.focus();
        });
    }

    /**
     * Render HTML for duplicate groups
     * @private
     */
    _renderGroups(groups) {
        return groups.map((group, index) => {
            const contactNames = group.map(contact => {
                const name = escapeHtml(contact.fn || 'Sin nombre');
                const phone = contact.tels.length > 0 ? escapeHtml(contact.tels[0]) : '';
                const phoneHtml = phone ? `<span class="duplicate-preview-phone">${phone}</span>` : '';
                return `<div class="duplicate-preview-contact">${name}${phoneHtml}</div>`;
            }).join('');
            
            return `
                <div class="duplicate-preview-group">
                    <div class="duplicate-preview-group-header">
                        Grupo ${index + 1} <span class="duplicate-preview-count">(${group.length} contactos)</span>
                    </div>
                    <div class="duplicate-preview-contacts">
                        ${contactNames}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Export singleton instance
export default new DuplicatePreview();
