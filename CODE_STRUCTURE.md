# Code Structure & File Organization

> **For AI Agents**: This document provides a quick reference for understanding file purposes, dependencies, and modification guidelines.

## 📂 File Tree with Descriptions

```
vcf-manager/
│
├── 📄 index.html
│   │ Purpose: Main HTML entry point, defines UI structure
│   │ Dependencies: All src/ files (loaded in specific order)
│   │ Modify when: Adding UI elements, changing layout, updating script order
│   │ Key elements: fileInput, grid, mergeModal, fab, searchInput
│   │ Note: Uses inline onclick handlers calling global instances
│
├── 📄 package.json
│   │ Purpose: NPM configuration, dependencies, test scripts
│   │ Dependencies: None
│   │ Modify when: Adding/updating dependencies, changing scripts
│   │ Key commands: npm test, npm run test:watch, npm run test:coverage
│
├── 📄 jest.config.js
│   │ Purpose: Jest testing configuration
│   │ Dependencies: None
│   │ Modify when: Changing test environment, adding setup files
│   │ Current: Uses jsdom environment for DOM testing
│
├── 📁 css/
│   └── 📄 styles.css
│       │ Purpose: All application styles
│       │ Dependencies: None
│       │ Modify when: Changing appearance, adding UI components
│       │ Uses: CSS Variables in :root for theming
│       │ Patterns: BEM-like naming, utility classes (.btn, .modal)
│
├── 📁 src/
│   │ Purpose: All application source code
│   │ Load Order: config → utils → core → features → app
│   │
│   ├── 📄 config.js
│   │   │ Purpose: Centralized configuration and constants
│   │   │ Dependencies: None (loaded first)
│   │   │ Exports: Config object
│   │   │ Used by: All modules for constants, messages, settings
│   │   │ Modify when: Adding constants, messages, default values
│   │   │ Structure:
│   │   │   - version: App version string
│   │   │   - appName: Application name
│   │   │   - phone: Phone number settings
│   │   │   - ui: UI configuration
│   │   │   - messages: UI messages
│   │
│   ├── 📄 app.js
│   │   │ Purpose: Application entry point and initialization
│   │   │ Dependencies: All other modules (loaded last)
│   │   │ Exports: None (creates global instances)
│   │   │ Global instances: core, mergeTool, autoMerger
│   │   │ Modify when: Adding new global instances, changing init logic
│   │   │ Initialization: DOMContentLoaded → initApp() → create instances
│   │
│   ├── 📁 core/
│   │   │ Purpose: Core business logic and fundamental operations
│   │   │
│   │   ├── 📄 contacts.js
│   │   │   │ Purpose: Contact management, state, selection, rendering
│   │   │   │ Dependencies: Config, VCFParser, PhoneUtils
│   │   │   │ Exports: ContactManager class
│   │   │   │ Used by: app.js (as global 'core')
│   │   │   │ Modify when: Changing state management, UI rendering, CRUD ops
│   │   │   │ State:
│   │   │   │   - contacts: Contact[] - All contacts
│   │   │   │   - selected: Set<string> - Selected IDs
│   │   │   │   - selectOrder: string[] - Selection order
│   │   │   │   - filterStr: string - Search filter
│   │   │   │   - sortAZ: boolean - Alphabetical sort flag
│   │   │   │ Key Methods:
│   │   │   │   - init(): Set up DOM listeners
│   │   │   │   - loadFile(file): Import VCF
│   │   │   │   - render(): Update UI
│   │   │   │   - toggleSelect(id): Select/deselect contact
│   │   │   │   - deleteSelected(): Remove selected contacts
│   │   │   │   - exportVCF(): Export to VCF file
│   │   │   │
│   │   │   └── 📄 vcf-parser.js
│   │   │       │ Purpose: Parse and export VCF (vCard) files
│   │   │       │ Dependencies: Config, PhoneUtils
│   │   │       │ Exports: VCFParser object (utility pattern)
│   │   │       │ Used by: ContactManager
│   │   │       │ Modify when: Supporting new VCF fields, changing format
│   │   │       │ Key Methods:
│   │   │       │   - parse(content): VCF string → Contact[]
│   │   │       │   - export(contacts): Contact[] → VCF string
│   │   │       │   - download(contacts): Trigger browser download
│   │   │       │ Private Methods:
│   │   │       │   - _parseBlock(block): Parse single vCard
│   │   │       │   - _generateId(): Create unique ID
│   │   │       │   - _decode(str): Decode quoted-printable
│   │   │
│   │   ├── 📁 features/
│   │   │   │ Purpose: User-facing feature implementations
│   │   │   │
│   │   │   ├── 📄 auto-merger.js
│   │   │   │   │ Purpose: Automatic duplicate detection and processing
│   │   │   │   │ Dependencies: Config, PhoneUtils, core, mergeTool (globals)
│   │   │   │   │ Exports: AutoMerger class
│   │   │   │   │ Used by: app.js (as global 'autoMerger')
│   │   │   │   │ Modify when: Adding detection methods, changing queue logic
│   │   │   │   │ State:
│   │   │   │   │   - queue: string[][] - Groups of duplicate IDs
│   │   │   │   │   - active: boolean - Auto-merge in progress
│   │   │   │   │ Key Methods:
│   │   │   │   │   - start(mode): Begin auto-merge ('name' or 'phone')
│   │   │   │   │   - processNext(): Process next group in queue
│   │   │   │   │   - cancel(): Stop auto-merge
│   │   │   │   │ Private Methods:
│   │   │   │   │   - _findDuplicatesByName(): Detect name duplicates
│   │   │   │   │   - _findDuplicatesByPhone(): Detect phone duplicates
│   │   │   │   │
│   │   │   │   └── 📄 merge-tool.js
│   │   │   │       │ Purpose: Manual merge UI and contact combination logic
│   │   │   │       │ Dependencies: Config, PhoneUtils, core, autoMerger (globals)
│   │   │   │       │ Exports: MergeTool class
│   │   │   │       │ Used by: app.js (as global 'mergeTool')
│   │   │   │       │ Modify when: Changing merge UI, data combination rules
│   │   │   │       │ State:
│   │   │   │       │   - pending: Object | null - Current merge operation
│   │   │   │       │     - targetId: Master contact ID
│   │   │   │       │     - idsToRemove: All IDs being merged
│   │   │   │       │     - data: Combined contact data
│   │   │   │       │     - originalObjects: Original contacts
│   │   │   │       │ Key Methods:
│   │   │   │       │   - init(): Start merge with selected contacts
│   │   │   │       │   - buildPending(ids): Combine contact data
│   │   │   │       │   - swapMaster(id): Change master contact
│   │   │   │       │   - commit(): Apply merge
│   │   │   │       │   - renderUI(): Display merge modal
│   │   │   │       │   - renderResultForm(): Render editable fields
│   │   │   │       │   - addField(type): Add empty field
│   │   │   │       │   - removeItem(key, index): Remove array item
│   │   │   │
│   │   │   └── 📁 utils/
│   │   │       │ Purpose: Pure utility functions with no side effects
│   │   │       │
│   │   │       └── 📄 phone.js
│   │   │           │ Purpose: Phone number normalization and formatting
│   │   │           │ Dependencies: Config
│   │   │           │ Exports: PhoneUtils object (utility pattern)
│   │   │           │ Used by: ContactManager, VCFParser, MergeTool
│   │   │           │ Modify when: Supporting new formats, changing rules
│   │   │           │ Key Methods:
│   │   │           │   - normalize(phone, defaultCode): Normalize to +XX format
│   │   │           │   - format(phone): Format for display
│   │   │           │ Rules:
│   │   │           │   - Remove non-numeric except +
│   │   │           │   - Convert 00XX to +XX
│   │   │           │   - Add default country code if missing
│   │   │
│   │   └── 📁 tests/
│   │       │ Purpose: Jest test suites
│   │       │ Structure: Mirrors src/ directory
│   │       │
│   │       ├── 📄 setup.js
│   │       │   │ Purpose: Test environment configuration
│   │       │   │ Sets up: jsdom, global mocks, test utilities
│   │       │
│   │       ├── 📄 integration.test.js
│   │       │   │ Purpose: End-to-end workflow tests
│   │       │   │ Tests: Complete user flows, multi-module interactions
│   │       │
│   │       ├── 📁 core/
│   │       │   ├── 📄 contacts.test.js
│   │       │   │   │ Tests: ContactManager class
│   │       │   │   │ Coverage: State management, rendering, CRUD
│   │       │   │
│   │       │   └── 📄 vcf-parser.test.js
│   │       │       │ Tests: VCFParser utility
│   │       │       │ Coverage: Parsing, exporting, encoding
│   │       │
│   │       ├── 📁 features/
│   │       │   ├── 📄 auto-merger.test.js
│   │       │   │   │ Tests: AutoMerger class
│   │       │   │   │ Coverage: Duplicate detection, queue processing
│   │       │   │
│   │       │   └── 📄 merge-tool.test.js
│   │       │       │ Tests: MergeTool class
│   │       │       │ Coverage: Merge logic, UI rendering, data combination
│   │       │
│   │       └── 📁 utils/
│   │           └── 📄 phone.test.js
│   │               │ Tests: PhoneUtils utility
│   │               │ Coverage: Normalization, formatting
│   │
│   └── 📁 Documentation Files (Root)
│       ├── 📄 README.md
│       │   │ Purpose: Project overview, quick start, basic info
│       │   │ Audience: General users, developers
│       │
│       ├── 📄 ARCHITECTURE.md
│       │   │ Purpose: Complete system architecture documentation
│       │   │ Audience: AI agents, developers
│       │   │ Content: Data flows, patterns, module descriptions
│       │
│       ├── 📄 CONTRIBUTING_FOR_AI.md
│       │   │ Purpose: Development guidelines for AI agents
│       │   │ Audience: AI agents
│       │   │ Content: Workflows, patterns, common tasks
│       │
│       └── 📄 CODE_STRUCTURE.md (this file)
│           │ Purpose: Quick reference for file organization
│           │ Audience: AI agents
│           │ Content: File tree, purposes, dependencies
```

## 🔗 Dependency Graph

```
Dependency Flow (arrows show "depends on"):

index.html
    ↓
[Scripts loaded in order]
    ↓
config.js (no dependencies)
    ↓
utils/phone.js → config.js
    ↓
core/vcf-parser.js → config.js, utils/phone.js
    ↓
core/contacts.js → config.js, core/vcf-parser.js, utils/phone.js
    ↓
features/auto-merger.js → config.js, utils/phone.js, [global: core, mergeTool]
    ↓
features/merge-tool.js → config.js, utils/phone.js, [global: core, autoMerger]
    ↓
app.js → ALL (creates global instances)
```

## 🎯 Quick Reference: Where to Make Changes

| Goal | Files to Modify | Order |
|------|----------------|-------|
| Add new configuration | `config.js` | 1 |
| Add new UI element | `index.html`, relevant class | 1, 2 |
| Change styling | `css/styles.css` | 1 |
| Add VCF field | `vcf-parser.js`, `merge-tool.js`, tests | 1, 2, 3 |
| Change contact rendering | `contacts.js` (`render()`, `_createCard()`) | 1 |
| Add duplicate detection | `auto-merger.js`, `index.html` (button), tests | 1, 2, 3 |
| Change merge logic | `merge-tool.js` (`buildPending()`) | 1 |
| Add utility function | `utils/[name].js`, update dependencies | 1, 2 |
| Modify phone handling | `utils/phone.js`, tests | 1, 2 |
| Add global instance | `app.js`, module file, `index.html` scripts | 1, 2, 3 |
| Change initialization | `app.js` (`initApp()`) | 1 |

## 📊 Module Relationships

### Core Modules
- **config.js**: Used by everyone, depends on nothing
- **contacts.js**: Central state manager, used by features
- **vcf-parser.js**: File I/O, used by contacts.js

### Feature Modules
- **auto-merger.js**: Uses core (global), opens merge-tool
- **merge-tool.js**: Uses core (global), called by auto-merger

### Utility Modules
- **phone.js**: Pure functions, used by multiple modules

### Global Instances
- **core** (ContactManager): Created in app.js, used everywhere
- **mergeTool** (MergeTool): Created in app.js, used by auto-merger
- **autoMerger** (AutoMerger): Created in app.js, called from HTML

## 🧩 Data Structures

### Contact Object
```javascript
{
  _id: string,          // Unique identifier (required)
  fn: string,           // Full name (required)
  tels: string[],       // Phone numbers (required, can be empty)
  emails: string[],     // Emails (required, can be empty)
  org: string,          // Organization (required, can be '')
  title?: string,       // Job title (optional)
  adr?: string,         // Address (optional)
  note?: string,        // Notes (optional)
  url?: string,         // Website (optional)
  bday?: string         // Birthday (optional)
}
```

### Merge Pending Object
```javascript
{
  targetId: string,           // ID to preserve
  idsToRemove: string[],      // All IDs in merge (master first)
  data: Contact,              // Combined contact data
  originalObjects: Contact[]  // Original contacts (master first)
}
```

### Auto-Merge Queue
```javascript
string[][] // Array of ID arrays
// Example: [['id1', 'id2'], ['id3', 'id4', 'id5']]
```

## 🔍 Finding Code

### By Feature
| Feature | Primary File | Supporting Files |
|---------|-------------|------------------|
| Import VCF | `contacts.js` | `vcf-parser.js` |
| Export VCF | `contacts.js` | `vcf-parser.js`, `phone.js` |
| Display contacts | `contacts.js` | `phone.js` |
| Search/Filter | `contacts.js` | - |
| Selection | `contacts.js` | - |
| Manual merge | `merge-tool.js` | `contacts.js`, `phone.js` |
| Auto-merge | `auto-merger.js` | `merge-tool.js`, `contacts.js`, `phone.js` |
| Phone formatting | `phone.js` | `config.js` |

### By UI Component
| Component | Rendering Code | Event Handlers |
|-----------|---------------|----------------|
| Header | `index.html` | Inline onclick |
| Contact grid | `contacts.js` (`render()`) | `toggleSelect()` |
| Contact card | `contacts.js` (`_createCard()`) | Inline onclick |
| Search bar | `index.html` | `core.setFilter()` |
| FAB | `contacts.js` (`_updateFAB()`) | Inline onclick |
| Merge modal | `merge-tool.js` (`renderUI()`) | Inline onclick |
| Source list | `merge-tool.js` (`_renderSourcesList()`) | `swapMaster()` |
| Result form | `merge-tool.js` (`renderResultForm()`) | Various methods |

## 📝 Naming Patterns

### Files
- Lowercase, hyphenated: `auto-merger.js`, `vcf-parser.js`
- Suffix `.test.js` for tests: `contacts.test.js`

### Classes
- PascalCase: `ContactManager`, `AutoMerger`, `MergeTool`
- One class per file

### Variables & Functions
- camelCase: `loadFile`, `contactList`, `selectedIds`
- Private methods: `_parseBlock`, `_createCard`

### Constants
- UPPER_SNAKE_CASE in Config: `DEFAULT_COUNTRY_CODE`
- camelCase elsewhere: `defaultFileName`

### DOM IDs
- camelCase: `fileInput`, `mergeModal`, `fabActionText`

### CSS Classes
- Kebab-case: `.btn-primary`, `.modal-overlay`, `.source-item`

## 🚀 Module Loading Order (Critical!)

The order in `index.html` must be maintained:

1. **config.js** - No dependencies, provides constants
2. **utils/phone.js** - Depends on Config
3. **core/vcf-parser.js** - Depends on Config, PhoneUtils
4. **core/contacts.js** - Depends on Config, VCFParser, PhoneUtils
5. **features/auto-merger.js** - Depends on all core, needs global instances
6. **features/merge-tool.js** - Depends on all core, needs global instances
7. **app.js** - Creates global instances, initializes app

**Breaking this order will cause reference errors!**

## 💡 Tips for AI Agents

### Before Editing
1. Check this file for file purpose
2. Check ARCHITECTURE.md for data flows
3. Check CONTRIBUTING_FOR_AI.md for patterns
4. Review existing tests for examples

### While Editing
1. Maintain dependency order
2. Export modules for testing
3. Update JSDoc comments
4. Follow existing patterns

### After Editing
1. Run `npm test`
2. Update this file if structure changed
3. Update ARCHITECTURE.md if flows changed
4. Update CONTRIBUTING_FOR_AI.md if patterns changed

---

**Last Updated**: 2026-02-02
**Version**: 11.1
**Maintained By**: AI Agents
