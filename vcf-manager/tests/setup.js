/**
 * Vitest Setup File
 * Configures DOM environment and global mocks
 */
import { vi } from 'vitest';

// Mock DOM elements required by the application
document.body.innerHTML = `
    <input type="file" id="fileInput" accept=".vcf">
    <div id="grid" class="grid"></div>
    <div id="statDisplay">0 contacts</div>
    <button id="btnExport">Export (0)</button>
    <div id="fab" class="fab">
        <span id="selCount">0</span>
        <span id="fabActionText">MERGE</span>
    </div>
    <div id="queueToast" class="queue-toast"></div>
    <div id="autoMergeHint"></div>
    <div id="mergeModal" class="modal-overlay">
        <div id="modalTitle"></div>
        <div id="mergeSourcesList"></div>
        <div id="mergeResultForm"></div>
        <button id="cloneButton" style="display:none"></button>
    </div>
    <select id="addFieldSelector">
        <option value="org">Añadir Organización</option>
        <option value="title">Añadir Cargo / Título</option>
        <option value="adr">Añadir Dirección</option>
        <option value="note">Añadir Notas</option>
        <option value="url">Añadir Sitio Web (URL)</option>
        <option value="bday">Añadir Cumpleaños</option>
    </select>
`;

// Mock window.alert
globalThis.alert = vi.fn();

// Mock window.confirm
globalThis.confirm = vi.fn(() => true);

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

// Mock FileReader
class MockFileReader {
    constructor() {
        this.onload = null;
    }
    readAsText(file) {
        if (this.onload && file._content) {
            this.onload({ target: { result: file._content } });
        }
    }
}
globalThis.FileReader = MockFileReader;

// Helper to create mock files with VCF content
globalThis.createMockVCFFile = (content) => {
    const file = new Blob([content], { type: 'text/vcard' });
    file._content = content;
    return file;
};

// Import modules using dynamic import for ESM compatibility
// These are imported synchronously since Vitest setup supports top-level await
const Config = (await import('../src/config.js')).default;
const PhoneUtils = (await import('../src/utils/phone.js')).default;
const VCFParser = (await import('../src/core/vcf-parser.js')).default;
const ContactManager = (await import('../src/core/contacts.js')).default;
const AutoMerger = (await import('../src/features/auto-merger.js')).default;
const MergeTool = (await import('../src/features/merge-tool.js')).default;

// Expose to global scope
globalThis.Config = Config;
globalThis.PhoneUtils = PhoneUtils;
globalThis.VCFParser = VCFParser;
globalThis.ContactManager = ContactManager;
globalThis.AutoMerger = AutoMerger;
globalThis.MergeTool = MergeTool;

// Also export CoreSystem alias for backward compatibility with existing tests
globalThis.CoreSystem = ContactManager;

// Create global instances like app.js does
globalThis.core = new ContactManager();
globalThis.mergeTool = new MergeTool();
globalThis.autoMerger = new AutoMerger();
