# VCF Manager - Architecture Documentation

> **AI Maintenance Note**: This document provides a complete overview of the system architecture, designed for AI agents maintaining this codebase.

## 🎯 System Overview

**VCF Manager** is a single-page application (SPA) for managing VCF (vCard) contact files. It allows users to import, merge, edit, and export contact information with duplicate detection capabilities.

**Technology Stack:**
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing**: Vitest with jsdom
- **Architecture**: Modular, class-based design with clear separation of concerns

## 📁 Directory Structure

```
vcf-manager/
├── index.html              # Main HTML entry point
├── package.json            # NPM configuration & dependencies
├── vitest.config.js        # Vitest test configuration
│
├── css/
│   └── styles.css          # All application styles (CSS Variables)
│
├── src/
│   ├── app.js              # Application entry point & initialization
│   ├── config.js           # Centralized configuration & constants
│   │
│   ├── core/               # Core business logic modules
│   │   ├── contacts.js     # Contact management & state (ContactManager class)
│   │   └── vcf-parser.js   # VCF parsing/exporting (VCFParser utility)
│   │
│   ├── features/           # Feature-specific modules
│   │   ├── auto-merger.js  # Automatic duplicate detection (AutoMerger class)
│   │   └── merge-tool.js   # Manual merge UI & logic (MergeTool class)
│   │
│   └── utils/              # Utility functions
│       └── phone.js        # Phone number normalization (PhoneUtils utility)
│
└── tests/                  # Test suites (Vitest)
    ├── setup.js            # Test environment setup
    ├── integration.test.js # End-to-end integration tests
    ├── core/               # Unit tests for core modules
    ├── features/           # Unit tests for feature modules
    └── utils/              # Unit tests for utilities
```

## 🏗️ Architecture Patterns

### 1. Modular Design
- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Core vs Features**: Core modules handle fundamental operations, features build on top
- **Utilities**: Shared helper functions with no side effects

### 2. State Management
- **Single Source of Truth**: `ContactManager` class holds all application state
- **State Properties**:
  - `contacts`: Array of contact objects
  - `selected`: Set of selected contact IDs
  - `selectOrder`: Array maintaining selection order
  - `filterStr`: Current filter string
  - `sortAZ`: Boolean for alphabetical sort

### 3. Global Instance Pattern
- Three global instances for HTML event handlers: `core`, `mergeTool`, `autoMerger`
- Initialized in `app.js` and accessible from inline HTML event handlers

### 4. Event-Driven UI
- DOM manipulation handled by class methods
- `render()` method pattern for UI updates
- Inline event handlers in HTML call global instance methods

## 🔄 Data Flow

### Contact Data Structure
```javascript
{
  _id: string,        // Unique identifier (generated)
  fn: string,         // Full name
  tels: string[],     // Phone numbers (normalized)
  emails: string[],   // Email addresses
  org: string,        // Organization
  title: string?,     // Job title (optional)
  adr: string?,       // Address (optional)
  note: string?,      // Notes (optional)
  url: string?,       // Website (optional)
  bday: string?       // Birthday (optional)
}
```

### Import Flow
```
User selects VCF file
  → ContactManager.loadFile()
    → FileReader reads file content
      → VCFParser.parse() extracts contacts
        → ContactManager.render() displays contacts
```

### Export Flow
```
User clicks export
  → ContactManager.exportVCF()
    → VCFParser.export() generates VCF content
      → VCFParser.download() triggers browser download
```

### Merge Flow
```
User selects contacts
  → User clicks merge button
    → MergeTool.init()
      → MergeTool.buildPending() combines contact data
        → MergeTool.renderUI() shows merge modal
          → User edits and confirms
            → MergeTool.commit() updates ContactManager.contacts
              → ContactManager.render() refreshes UI
```

### Auto-Merge Flow
```
User clicks auto-merge (name or phone)
  → AutoMerger.start(mode)
    → AutoMerger._findDuplicatesByName/Phone()
      → Queue populated with duplicate groups
        → AutoMerger.processNext() selects first group
          → MergeTool.init() opens merge modal
            → On commit, AutoMerger.processNext() continues
              → Process repeats until queue empty
```

## 🔑 Key Classes & Modules

### ContactManager (core/contacts.js)
**Responsibility**: Manages contact list, selection state, filtering, and rendering

**Key Methods**:
- `init()`: Set up DOM event listeners
- `loadFile(file)`: Import VCF file
- `render()`: Update UI with current state
- `toggleSelect(id)`: Toggle contact selection
- `deleteSelected()`: Remove selected contacts
- `exportVCF()`: Export contacts to VCF file

**State Properties**:
- `contacts`: All contacts
- `selected`: Set of selected IDs
- `selectOrder`: Order of selection
- `filterStr`: Search filter
- `sortAZ`: Sort alphabetically

### VCFParser (core/vcf-parser.js)
**Responsibility**: Parse VCF files and export contacts to VCF format

**Key Methods**:
- `parse(content)`: Parse VCF string → contact objects array
- `export(contacts)`: Convert contact objects → VCF string
- `download(contacts)`: Trigger browser download of VCF file

**Internal Methods**:
- `_parseBlock(block)`: Parse single vCard
- `_generateId()`: Create unique ID
- `_decode(str)`: Decode quoted-printable encoding

### MergeTool (features/merge-tool.js)
**Responsibility**: Handle contact merging and editing UI

**Key Methods**:
- `init()`: Initialize merge with selected contacts
- `buildPending(ids)`: Combine contact data (first ID is master)
- `swapMaster(newMasterId)`: Change which contact is master
- `commit()`: Apply merge to contact list
- `renderUI()`: Display merge modal

**Pending Structure**:
```javascript
{
  targetId: string,           // ID of master contact (preserved)
  idsToRemove: string[],      // All IDs involved in merge
  data: Contact,              // Merged contact data
  originalObjects: Contact[]  // Original contacts (master first)
}
```

### AutoMerger (features/auto-merger.js)
**Responsibility**: Automatic duplicate detection and sequential processing

**Key Methods**:
- `start(mode)`: Start auto-merge ('name' or 'phone')
- `processNext()`: Process next group in queue
- `cancel()`: Stop auto-merge process

**Internal Methods**:
- `_findDuplicatesByName()`: Group by normalized name
- `_findDuplicatesByPhone()`: Group by normalized phone

**Queue Structure**: Array of ID arrays `string[][]`

### PhoneUtils (utils/phone.js)
**Responsibility**: Phone number normalization and formatting

**Key Methods**:
- `normalize(phone, defaultCode)`: Normalize to international format
- `format(phone)`: Format for display (supports +34 country code formatting)

**Normalization Rules**:
1. Remove non-numeric except `+`
2. Convert `00` prefix to `+`
3. Add default country code if missing (configurable, default: `+34`)

### Config (config.js)
**Responsibility**: Centralized configuration and constants

**Structure**:
```javascript
{
  version: string,
  appName: string,
  phone: { defaultCountryCode, minLength },
  ui: { maxTelsDisplay, defaultFileName },
  messages: { /* UI messages */ }
}
```

## 🎨 UI/UX Patterns

### Component Rendering
- **Cards**: Contact cards in grid layout
- **Modal**: Merge tool overlay
- **FAB**: Floating Action Button (context-aware)
- **Toast**: Queue status notification

### Responsive Design
- CSS Grid for contact layout
- Flexbox for header and controls
- CSS Variables for theming

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard-friendly interactions

## 🧪 Testing Strategy

### Test Organization
- **Unit Tests**: Individual class/module behavior
- **Integration Tests**: Multi-module workflows
- **Setup**: jsdom for DOM simulation

### Coverage Areas
1. Contact management operations
2. VCF parsing and export
3. Phone number utilities
4. Merge workflows
5. Auto-merge detection
6. Edge cases and error conditions

### Test Execution
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## 🔧 Build & Development

### No Build Step Required
- Pure vanilla JavaScript (ES6 modules in browser)
- No transpilation needed
- Direct file serving via HTTP server

### Development Workflow
1. Open `index.html` in browser (via HTTP server)
2. Edit files in `src/`
3. Refresh browser to see changes
4. Run tests with `npm test`

### Module Loading
Scripts loaded in specific order in `index.html`:
1. `config.js` (constants)
2. `utils/phone.js` (dependencies)
3. `core/vcf-parser.js`
4. `core/contacts.js`
5. `features/auto-merger.js`
6. `features/merge-tool.js`
7. `app.js` (initialization)

## 🔒 Security Considerations

### Input Validation
- Phone numbers normalized before comparison
- VCF content sanitized during parsing
- User confirmations for destructive operations

### Data Privacy
- All processing client-side (no server)
- No external data transmission
- Contact data never leaves browser

## 📝 Code Conventions

### Naming
- **Classes**: PascalCase (e.g., `ContactManager`)
- **Functions**: camelCase (e.g., `loadFile`)
- **Private methods**: Prefix with `_` (e.g., `_parseBlock`)
- **Constants**: UPPER_SNAKE_CASE in Config
- **DOM IDs**: camelCase (e.g., `fileInput`)

### File Organization
- One class per file
- Related utilities in same module
- Tests mirror source structure

### Comments
- JSDoc for public methods
- Inline comments for complex logic
- File headers explain module purpose

### Error Handling
- User-facing errors shown via `alert()`
- Console logging for debugging
- Graceful degradation for missing DOM elements

## 🚀 Extension Points

### Adding New Features
1. Create new file in `src/features/`
2. Create corresponding test in `tests/features/`
3. Initialize in `app.js` if needed
4. Add to HTML script loading order

### Adding New Fields
1. Update `Config.messages` for UI text
2. Add field to `VCFParser._parseBlock()`
3. Add field to `VCFParser.export()`
4. Update `MergeTool.buildPending()` merge logic
5. Update `MergeTool.renderResultForm()` UI

### Modifying Duplicate Detection
- Edit `AutoMerger._findDuplicatesByName()`
- Edit `AutoMerger._findDuplicatesByPhone()`
- Or add new detection method

## 🐛 Common Issues & Solutions

### Issue: Tests fail with "vitest: not found"
**Solution**: Run `npm install` to install dependencies

### Issue: Changes not reflected in browser
**Solution**: Hard refresh (Ctrl+Shift+R) or clear cache

### Issue: Modal not displaying
**Solution**: Check `mergeModal` element exists in HTML

### Issue: Merge not combining all phones
**Solution**: Verify `PhoneUtils.normalize()` produces consistent format

## 📚 Additional Resources

- **VCF Specification**: RFC 6350 (vCard Format Specification)
- **Testing**: Vitest Documentation (vitest.dev)
- **ES6 Modules**: MDN Web Docs

---

**Last Updated**: 2026-02-02
**Maintained By**: AI Agents
**Version**: 11.1
