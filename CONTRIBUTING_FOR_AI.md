# Contributing Guide for AI Agents

> **Purpose**: Guidelines for AI agents maintaining and extending this codebase.

## Core Principles

1. **Minimal Changes** - Make the smallest possible changes to achieve the goal
2. **Test-Driven** - Run tests before and after changes (`npm test`)
3. **Consistency** - Follow existing patterns, naming conventions, and style
4. **Documentation** - Update JSDoc comments when changing function signatures

## Development Workflow

```bash
cd vcf-manager
npm install
npm test                 # Establish baseline
# ... make changes ...
npm test                 # Verify changes
npm run test:coverage    # Check coverage
```

## File Organization

```
src/
├── config.js          # Add constants here
├── app.js             # Bootstrap, imports all, exposes to window
├── core/
│   ├── contacts.js    # Contact state, CRUD, UI rendering
│   └── vcf-parser.js  # VCF file parse/export
├── features/
│   ├── auto-merger.js # Duplicate detection queue
│   └── merge-tool.js  # Merge modal UI
└── utils/
    └── phone.js       # Phone normalization
```

## When to Edit Each File

| File | Edit when... |
|------|--------------|
| `config.js` | Adding settings, messages, defaults |
| `contacts.js` | Changing state, selection, render, filter/sort |
| `vcf-parser.js` | Adding VCF fields, changing parse/export |
| `auto-merger.js` | Adding duplicate detection methods |
| `merge-tool.js` | Changing merge UI, field editing |
| `phone.js` | Supporting new country codes, formats |
| `app.js` | Adding new global instances |

## Coding Standards

### Naming
- Classes: `PascalCase`
- Functions/Methods: `camelCase`
- Private Methods: `_camelCase`
- Constants in Config: `camelCase` properties

### ES Modules
All files use ES module syntax:
```javascript
import Config from '../config.js';
export default MyClass;
```

### JSDoc
```javascript
/**
 * Brief description
 * @param {Type} param - Description
 * @returns {Type} Description
 */
```

## Testing Guidelines

Structure: `tests/` mirrors `src/`

```javascript
describe('ClassName', () => {
  describe('methodName', () => {
    test('should do something specific', () => {
      // Arrange, Act, Assert
    });
  });
});
```

## Common Patterns

### Adding a New Contact Field

1. **vcf-parser.js**: Add to `_parseBlock()` and `export()`
2. **merge-tool.js**: Add to `buildPending()` and `renderResultForm()`
3. **tests/**: Add parsing and merge tests

### Adding Duplicate Detection Method

1. **auto-merger.js**: Add `_findDuplicatesBy*()` method
2. **auto-merger.js**: Update `start()` to handle new mode
3. **index.html**: Add button with `onclick="autoMerger.start('mode')"`
4. **tests/**: Add detection tests

## Common Pitfalls

1. **Breaking window globals** - `core`, `mergeTool`, `autoMerger` are used in HTML onclick
2. **Missing imports** - All modules need explicit `import` statements
3. **State without render** - After modifying `core.contacts`, call `core.render()`
4. **Missing DOM checks** - Always check `if (element)` before using

## Pre-Commit Checklist

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] JSDoc updated for changed functions
- [ ] README.md updated if user-facing changes
- [ ] No debug code left behind

---

**Last Updated**: 2026-02-03 | **Version**: 11.1
