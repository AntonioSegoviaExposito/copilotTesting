/**
 * Jest Setup File
 * Configures DOM environment and global mocks
 */

const fs = require('fs');
const path = require('path');

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

// Load all source modules in correct order
const srcPath = path.join(__dirname, '../src');

const configCode = fs.readFileSync(path.join(srcPath, 'config.js'), 'utf8');
const phoneCode = fs.readFileSync(path.join(srcPath, 'utils/phone.js'), 'utf8');
const vcfParserCode = fs.readFileSync(path.join(srcPath, 'core/vcf-parser.js'), 'utf8');
const contactsCode = fs.readFileSync(path.join(srcPath, 'core/contacts.js'), 'utf8');
const autoMergerCode = fs.readFileSync(path.join(srcPath, 'features/auto-merger.js'), 'utf8');
const mergeToolCode = fs.readFileSync(path.join(srcPath, 'features/merge-tool.js'), 'utf8');

// Combine and execute code
const combinedCode = `
    ${configCode}
    ${phoneCode}
    ${vcfParserCode}
    ${contactsCode}
    ${autoMergerCode}
    ${mergeToolCode}
    return { Config, PhoneUtils, VCFParser, ContactManager, AutoMerger, MergeTool };
`;

const modules = new Function(combinedCode)();

// Export to global scope
global.Config = modules.Config;
global.PhoneUtils = modules.PhoneUtils;
global.VCFParser = modules.VCFParser;
global.ContactManager = modules.ContactManager;
global.AutoMerger = modules.AutoMerger;
global.MergeTool = modules.MergeTool;

// Also export CoreSystem alias for backward compatibility with existing tests
global.CoreSystem = modules.ContactManager;

// Create global instances like app.js does
global.core = new global.ContactManager();
global.mergeTool = new global.MergeTool();
global.autoMerger = new global.AutoMerger();
