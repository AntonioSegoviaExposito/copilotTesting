/**
 * Jest Setup File
 * Configures DOM environment and global mocks
 */

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
    </div>
    <select id="addFieldSelector">
        <option value="title">Title</option>
        <option value="adr">Address</option>
    </select>
`;

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

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
global.FileReader = MockFileReader;

// Helper to create mock files with VCF content
global.createMockVCFFile = (content) => {
    const file = new Blob([content], { type: 'text/vcard' });
    file._content = content;
    return file;
};

// Import modules using require (proper CommonJS imports for Jest coverage)
global.Config = require('../src/config.js');
global.PhoneUtils = require('../src/utils/phone.js');
global.VCFParser = require('../src/core/vcf-parser.js');
global.ContactManager = require('../src/core/contacts.js');
global.AutoMerger = require('../src/features/auto-merger.js');
global.MergeTool = require('../src/features/merge-tool.js');

// Also export CoreSystem alias for backward compatibility with existing tests
global.CoreSystem = global.ContactManager;

// Create global instances like app.js does
global.core = new global.ContactManager();
global.mergeTool = new global.MergeTool();
global.autoMerger = new global.AutoMerger();
