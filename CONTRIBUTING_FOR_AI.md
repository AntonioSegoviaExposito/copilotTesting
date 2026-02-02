# Contributing Guide for AI Agents

> **Purpose**: This guide provides explicit instructions for AI agents maintaining and extending this codebase. Follow these guidelines to ensure consistency, reliability, and maintainability.

## 🎯 Core Principles

### 1. Minimal Changes
- Make the smallest possible changes to achieve the goal
- Don't refactor unrelated code
- Preserve existing working functionality
- Update only what's necessary

### 2. Test-Driven Development
- Run tests BEFORE making changes to understand current state
- Write tests for new features
- Ensure all tests pass AFTER changes
- Run: `npm test`

### 3. Clear Documentation
- Update JSDoc comments when changing function signatures
- Add inline comments for complex logic
- Update ARCHITECTURE.md for structural changes
- Keep README.md current

### 4. Consistency
- Follow existing code patterns
- Match naming conventions
- Use same formatting style
- Maintain file organization

## 📋 Development Workflow

### Before Making Changes
```bash
# 1. Navigate to project
cd /home/runner/work/234578/234578/vcf-manager

# 2. Install dependencies (if needed)
npm install

# 3. Run tests to establish baseline
npm test

# 4. Review relevant files
# - Read ARCHITECTURE.md for context
# - Check existing implementation
# - Understand data flows
```

### Making Changes

#### Step 1: Plan
1. Read the issue/requirement carefully
2. Identify minimal set of files to modify
3. Consider impact on existing functionality
4. Review ARCHITECTURE.md for relevant modules

#### Step 2: Implement
1. Edit source files in `src/`
2. Follow existing patterns
3. Add JSDoc comments for new public methods
4. Add inline comments for complex logic

#### Step 3: Test
1. Write/update tests in `tests/`
2. Mirror source structure (e.g., `src/core/contacts.js` → `tests/core/contacts.test.js`)
3. Run tests: `npm test`
4. Fix failures

#### Step 4: Document
1. Update JSDoc comments
2. Update ARCHITECTURE.md if structure changed
3. Update README.md if user-facing changes

#### Step 5: Verify
1. Run full test suite: `npm test`
2. Manually test in browser (open `index.html`)
3. Check console for errors
4. Test edge cases

### After Making Changes
```bash
# Run final test suite
npm test

# Verify all 152+ tests pass
# Review changes
git status
git diff
```

## 🏗️ Code Structure Guide

### File Organization
```
src/
├── config.js          # Add constants here
├── app.js             # Modify initialization here
├── core/              # Fundamental operations
│   ├── contacts.js    # Contact state & CRUD operations
│   └── vcf-parser.js  # VCF file handling
├── features/          # User-facing features
│   ├── auto-merger.js # Duplicate detection
│   └── merge-tool.js  # Merge UI & logic
└── utils/             # Pure helper functions
    └── phone.js       # Phone formatting
```

### When to Edit Each File

#### `config.js` - Edit when:
- Adding new configuration options
- Changing default values
- Adding UI messages (Spanish)
- Modifying phone settings

#### `core/contacts.js` - Edit when:
- Changing contact state management
- Modifying selection logic
- Updating render logic
- Changing filter/sort behavior

#### `core/vcf-parser.js` - Edit when:
- Adding support for new VCF fields
- Changing parsing logic
- Modifying export format
- Fixing encoding issues

#### `features/auto-merger.js` - Edit when:
- Adding new duplicate detection methods
- Changing queue processing
- Modifying duplicate grouping logic

#### `features/merge-tool.js` - Edit when:
- Changing merge UI
- Modifying data combination logic
- Adding/removing editable fields
- Changing master/slave behavior

#### `utils/phone.js` - Edit when:
- Supporting new country codes
- Changing normalization rules
- Modifying display format

#### `app.js` - Edit when:
- Adding new global instances
- Changing initialization order
- Adding startup logic

## 📝 Coding Standards

### JavaScript Style

#### Naming Conventions
```javascript
// Classes: PascalCase
class ContactManager { }

// Functions/Methods: camelCase
function loadFile() { }

// Private Methods: _camelCase
_parseBlock() { }

// Constants: UPPER_SNAKE_CASE (in Config)
const DEFAULT_COUNTRY_CODE = '+34';

// Variables: camelCase
const contactList = [];

// DOM IDs: camelCase
<div id="mergeModal">
```

#### Function Documentation
```javascript
/**
 * Brief description of what the function does
 * 
 * @param {Type} paramName - Description of parameter
 * @param {Type} [optionalParam] - Optional parameter
 * @returns {Type} Description of return value
 * 
 * @example
 * const result = functionName(arg1, arg2);
 */
function functionName(paramName, optionalParam) {
  // Implementation
}
```

#### Complex Logic Comments
```javascript
// GOOD: Explain WHY, not WHAT
// Sort by name length because longer names are typically more complete
contacts.sort((a, b) => b.fn.length - a.fn.length);

// AVOID: Redundant comments
// Sort contacts
contacts.sort(...);
```

### HTML Conventions
- Use semantic HTML5 elements
- Add `id` for JavaScript-accessed elements
- Use `class` for styling
- Inline handlers call global instance methods
- Include accessibility labels

### CSS Conventions
- Use CSS Variables for colors/themes (defined in `:root`)
- Use semantic class names (`.btn-primary`, `.modal`)
- Avoid inline styles in HTML (except dynamic values)
- Use flexbox/grid for layouts

## 🧪 Testing Guidelines

### Test File Structure
```javascript
// tests/core/contacts.test.js
describe('ContactManager', () => {
  describe('Constructor', () => {
    it('should initialize with empty contacts array', () => {
      const manager = new ContactManager();
      expect(manager.contacts).toEqual([]);
    });
  });
  
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const manager = new ContactManager();
      
      // Act
      manager.methodName();
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Coverage Goals
- All public methods tested
- Edge cases covered
- Error conditions tested
- Integration workflows tested

### Writing Good Tests
```javascript
// GOOD: Specific, single assertion
it('should add contact ID to selected Set when not selected', () => {
  const manager = new ContactManager();
  manager.contacts = [{ _id: 'id1', fn: 'Test' }];
  
  manager.toggleSelect('id1');
  
  expect(manager.selected.has('id1')).toBe(true);
});

// AVOID: Vague, multiple concerns
it('should work correctly', () => {
  // Multiple assertions testing different things
});
```

## 🔄 Common Modification Patterns

### Adding a New Contact Field

#### 1. Update Config (if UI text needed)
```javascript
// config.js
messages: {
  // Add new message
  fieldLabel: 'New Field',
}
```

#### 2. Update VCF Parser
```javascript
// core/vcf-parser.js
_parseBlock(block) {
  return {
    // ... existing fields ...
    newField: this._decode(get('NEWFIELD')) || undefined
  };
}

export(contacts) {
  // ... existing export logic ...
  if (contact.newField) output += `NEWFIELD:${contact.newField}\n`;
}
```

#### 3. Update Merge Tool
```javascript
// features/merge-tool.js
buildPending(ids) {
  this.pending = {
    data: {
      // ... existing fields ...
      newField: masterContact.newField || slaves.find(s => s.newField)?.newField || undefined
    }
  };
}

renderResultForm() {
  // ... existing fields ...
  if (data.newField !== undefined) {
    html += textInput('Field Label', 'newField', data.newField);
  }
}
```

#### 4. Write Tests
```javascript
// tests/core/vcf-parser.test.js
it('should parse NEWFIELD when present', () => {
  const content = 'BEGIN:VCARD\nVERSION:3.0\nFN:Test\nNEWFIELD:value\nEND:VCARD';
  const result = VCFParser.parse(content);
  expect(result[0].newField).toBe('value');
});
```

### Adding a New Duplicate Detection Method

#### 1. Add Method to AutoMerger
```javascript
// features/auto-merger.js
_findDuplicatesByEmail() {
  const emailMap = {};
  
  core.contacts.forEach(contact => {
    contact.emails.forEach(email => {
      const normalized = email.toLowerCase().trim();
      if (normalized) {
        if (!emailMap[normalized]) emailMap[normalized] = [];
        emailMap[normalized].push(contact._id);
      }
    });
  });
  
  return Object.values(emailMap).filter(g => g.length > 1);
}
```

#### 2. Update Start Method
```javascript
start(mode) {
  const groups = mode === 'name' 
    ? this._findDuplicatesByName()
    : mode === 'phone'
    ? this._findDuplicatesByPhone()
    : this._findDuplicatesByEmail(); // Add new option
    
  // ... rest of logic
}
```

#### 3. Add UI Button
```html
<!-- index.html -->
<button class="btn btn-warning" onclick="autoMerger.start('email')">
  📧 Email
</button>
```

#### 4. Write Tests
```javascript
// tests/features/auto-merger.test.js
describe('start - Email Mode', () => {
  it('should find duplicates by email', () => {
    // Test implementation
  });
});
```

### Modifying UI Behavior

#### 1. Identify Component
- Header buttons → `index.html` + method in relevant class
- Contact cards → `ContactManager.render()` and `_createCard()`
- Merge modal → `MergeTool.renderUI()` and `renderResultForm()`
- FAB → `ContactManager._updateFAB()`

#### 2. Update Render Method
```javascript
// Make changes to rendering logic
// Keep existing patterns (innerHTML updates, event handlers)
```

#### 3. Update Tests
```javascript
// Update or add tests for new UI behavior
// Mock DOM elements as needed
```

## 🚨 Common Pitfalls to Avoid

### 1. Breaking Global References
```javascript
// DON'T: Change global variable names without updating HTML
let core; // Used in HTML onclick="core.method()"

// DO: Keep global names consistent, or update all HTML references
```

### 2. Forgetting Module Exports
```javascript
// DON'T: Forget to export for tests
class MyClass { }

// DO: Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MyClass;
}
```

### 3. Breaking Initialization Order
```javascript
// DON'T: Load files out of order
<script src="app.js"></script>      <!-- Uses Config -->
<script src="config.js"></script>   <!-- Too late! -->

// DO: Maintain dependency order (see ARCHITECTURE.md)
```

### 4. Mutating State Unexpectedly
```javascript
// DON'T: Modify state without calling render()
core.contacts.push(newContact); // UI not updated!

// DO: Modify state, then render
core.contacts.push(newContact);
core.render();
```

### 5. Not Handling Missing DOM Elements
```javascript
// DON'T: Assume element exists
document.getElementById('grid').innerHTML = ''; // Crashes if null

// DO: Check before using
const grid = document.getElementById('grid');
if (grid) grid.innerHTML = '';
```

## 🐛 Debugging Tips

### Test Failures
1. Read error message carefully
2. Check which test file/describe block
3. Review recent changes to that module
4. Run single test: `npm test -- -t "test name"`
5. Add `console.log` in test to inspect values

### Runtime Errors
1. Open browser console
2. Check error message and stack trace
3. Verify HTML element IDs match JavaScript
4. Check initialization order in `index.html`
5. Verify global instances initialized

### Data Issues
1. Log contact objects to console
2. Check VCF parsing logic
3. Verify phone normalization
4. Check merge combination logic
5. Inspect browser localStorage (not used, but check anyway)

## ✅ Pre-Commit Checklist

Before finalizing changes:
- [ ] All tests pass (`npm test`)
- [ ] No console errors in browser
- [ ] Manual testing completed
- [ ] JSDoc comments updated
- [ ] ARCHITECTURE.md updated (if needed)
- [ ] No leftover debug code (`console.log`, etc.)
- [ ] Code follows existing patterns
- [ ] Edge cases considered

## 📞 Getting Help

### Understanding Existing Code
1. Read ARCHITECTURE.md first
2. Review JSDoc comments in source files
3. Check test files for usage examples
4. Trace data flow diagrams in ARCHITECTURE.md

### Making Complex Changes
1. Break into smaller steps
2. Test each step independently
3. Commit working states frequently
4. Document reasoning in comments

### Uncertainty
- If unsure, make minimal changes
- Prefer adding new code over modifying existing
- Write tests first to clarify requirements
- Document assumptions in comments

---

**Remember**: This codebase is maintained by AI agents. Clear, explicit, and well-documented code is essential. When in doubt, over-communicate through comments and documentation.

**Last Updated**: 2026-02-02
**Version**: 11.1
