# Contributing Guide for AI Agents

> **Purpose**: Guidelines for AI agents maintaining and extending this codebase.

## Core Principles

### KISS - Keep It Simple, Stupid

1. **Simplicity Over Complexity** - Always choose the simplest solution that works
   - Modern, simple tools that are easy to maintain
   - Improvements mean more functionality or equal functionality with less code
   - Never add complexity without clear justification

2. **Minimal Changes** - Make the smallest possible changes to achieve the goal
   - Surgical precision: change only what's necessary
   - Preserve working code unless there's a compelling reason to refactor

3. **Test-Driven** - Run tests before and after changes (`npm test`)
   - Establish baseline before making changes
   - Verify changes don't break existing functionality
   - Maintain or improve test coverage

4. **Consistency** - Follow existing patterns, naming conventions, and style
   - Match the existing codebase architecture
   - Use established patterns, don't invent new ones unnecessarily

5. **Documentation** - Update JSDoc comments when changing function signatures
   - Clear, concise documentation
   - Explain the "why" not just the "what"

### Critical Thinking Framework

Before making any change, ask yourself:

- **Why?** Why is this change necessary? What problem does it solve?
- **Alternatives?** What other approaches could solve this? Why is this the best?
- **Simpler?** Is there a simpler way to achieve the same goal?
- **Trade-offs?** What are we gaining? What are we losing?
- **Impact?** What other parts of the system does this affect?
- **Maintenance?** Will this be easy to maintain and understand in 6 months?

## Architecture Philosophy

### SPA-Only Design

This is a **Single Page Application (SPA)** with NO server-side components:

- **Pure client-side**: Vanilla ES6+ modules running entirely in the browser
- **No Node.js runtime**: Node/npm are ONLY for development tools (testing, etc.)
- **No build process required**: The app runs directly from HTML/JS/CSS files
- **Static deployment**: Can be served from any HTTP server or CDN
- **Direct file loading**: `index.html` can be opened directly in a browser

**When adding features:**
- Never introduce server-side requirements
- Keep the app runnable without a build step
- Use browser APIs directly (File API, localStorage, etc.)
- Avoid frameworks that require compilation or bundling for production

## Development Workflow

```bash
cd vcf-manager
npm install              # Install dev dependencies (testing tools only)
npm test                 # Establish baseline
# ... make changes ...
npm test                 # Verify changes
npm run test:coverage    # Check coverage
```

**Note**: npm is used ONLY for development tools (Vitest for testing). The application itself requires no build process and runs directly in the browser.

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

1. **Breaking window globals** - `core`, `mergeTool`, `autoMerger` are used in HTML onclick handlers
2. **Missing imports** - All modules need explicit `import` statements
3. **State without render** - After modifying `core.contacts`, call `core.render()`
4. **Missing DOM checks** - Always check `if (element)` before using DOM elements
5. **Adding unnecessary dependencies** - Keep the app dependency-free for production
6. **Breaking the no-build requirement** - Don't introduce transpilation or bundling needs

## Decision-Making Guide

### When to Add Code
- **Do**: Add code when it solves a real user problem with minimal complexity
- **Don't**: Add code just because it might be useful someday (YAGNI principle)

### When to Refactor
- **Do**: Refactor when it reduces complexity or improves maintainability
- **Don't**: Refactor just to change style or use a "better" pattern without clear benefit

### Choosing Between Solutions
1. **Simplest solution**: Prefer the approach with fewer moving parts
2. **Less code**: More functionality with less code is an improvement
3. **Browser-native**: Use browser APIs over external libraries when practical
4. **Testable**: Choose approaches that are easier to test

### Red Flags (Question these choices)
- Adding a new library or framework
- Introducing a build step or compilation requirement
- Creating abstractions with only one use case
- Duplicating functionality that already exists
- Making changes that require updating many files

## Pre-Commit Checklist

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] JSDoc updated for changed functions
- [ ] README.md updated if user-facing changes
- [ ] No debug code left behind

---

**Last Updated**: 2026-02-03 | **Version**: 11.1
