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
    <div id="mergeModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">>
        <div id="modalTitle"></div>
        <div id="mergeSourcesList"></div>
        <div id="mergeResultForm"></div>
        <button id="cloneButton" style="display:none"></button>
    </div>
    <select id="addFieldSelector">
        <option value="org">Add Organization</option>
        <option value="title">Add Title</option>
        <option value="adr">Add Address</option>
        <option value="note">Add Notes</option>
        <option value="url">Add Website (URL)</option>
        <option value="bday">Add Birthday</option>
        <option value="photo">Add Photo (v4.0)</option>
        <option value="nickname">Add Nickname (v4.0)</option>
        <option value="gender">Add Gender (v4.0)</option>
        <option value="kind">Add Kind (v4.0)</option>
        <option value="anniversary">Add Anniversary (v4.0)</option>
        <option value="lang">Add Language (v4.0)</option>
        <option value="impp">Add Instant Messaging (v4.0)</option>
        <option value="geo">Add Geographic Position (v4.0)</option>
        <option value="tz">Add Timezone (v4.0)</option>
        <option value="categories">Add Categories (v4.0)</option>
        <option value="role">Add Role (v4.0)</option>
    </select>
`;

// Mock window.alert
globalThis.alert = vi.fn();

// Mock window.confirm
globalThis.confirm = vi.fn(() => true);

// Mock Toast for testing
const Toast = (await import('../src/utils/toast.js')).default;
globalThis.Toast = Toast;

// Mock Toast methods to be spies that can be verified in tests
Toast.show = vi.fn();
Toast.info = vi.fn();
Toast.success = vi.fn();
Toast.warning = vi.fn();
Toast.error = vi.fn();
Toast.confirm = vi.fn(async () => true); // Default to confirmed

// Mock DuplicatePreview for testing
const DuplicatePreview = (await import('../src/features/duplicate-preview.js')).default;
globalThis.DuplicatePreview = DuplicatePreview;

// Mock DuplicatePreview.show to auto-confirm by default
DuplicatePreview.show = vi.fn(async () => true); // Default to confirmed

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock FileReader
class MockFileReader {
    constructor() {
        this.onload = null;
        this.onerror = null;
    }
    readAsText(file) {
        if (this.onload && file._content) {
            this.onload({ target: { result: file._content } });
        }
    }
    readAsDataURL(file) {
        if (file._error && this.onerror) {
            this.onerror(new Error('Read failed'));
            return;
        }
        if (this.onload) {
            // Simulate data URI result
            const dataUri = file._dataUri || 'data:image/png;base64,mockBase64Data';
            this.onload({ target: { result: dataUri } });
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
const { escapeHtml } = (await import('../src/utils/html.js'));

// Expose to global scope
globalThis.Config = Config;
globalThis.PhoneUtils = PhoneUtils;
globalThis.VCFParser = VCFParser;
globalThis.ContactManager = ContactManager;
globalThis.AutoMerger = AutoMerger;
globalThis.MergeTool = MergeTool;
globalThis.escapeHtml = escapeHtml;

// Also export CoreSystem alias for backward compatibility with existing tests
globalThis.CoreSystem = ContactManager;

// Create global instances like app.js does
globalThis.core = new ContactManager();
globalThis.mergeTool = new MergeTool();
globalThis.autoMerger = new AutoMerger();
