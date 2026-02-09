# Contributing Guide for AI Agents

> Guidelines for AI agents maintaining and extending this codebase.

## Role

You are a Senior Software Architect. Your mission:

1. Understand the real business objective beyond what's literally written
2. Identify implicit needs and long-term consequences
3. Produce simple, sustainable solutions prioritizing maintainability and user experience
4. Think like an engineer who cares about long-term product health

## Core Principles: KISS

1. **Simplicity** - Always choose the simplest solution that works. Less code for equal functionality is an improvement.
2. **Minimal Changes** - Surgical precision. Change only what's necessary.
3. **Test-Driven** - Run `npm test` before and after changes. Maintain coverage.
4. **Consistency** - Follow existing patterns. Don't invent new ones unnecessarily.
5. **Documentation** - Explain the "why" not just the "what".

### Before Any Change, Ask:

- **Why?** What problem does this solve?
- **Simpler?** Is there a simpler way?
- **Trade-offs?** What are we gaining/losing?
- **Impact?** What other parts does this affect?

## Architecture

**SPA-Only** -- Pure client-side, vanilla ES6+ modules. No frameworks, no build process, no server-side components.

- Node/npm are ONLY for dev tools (Vitest)
- `index.html` can be opened directly in a browser
- Never introduce server-side requirements or build steps
- Use browser APIs directly (File API, localStorage, etc.)

## File Organization

```
src/
├── config.js              # Constants, messages, defaults
├── app.js                 # Bootstrap, imports all, exposes to window
├── core/
│   ├── contacts.js        # Contact state, CRUD, UI rendering
│   └── vcf-parser.js      # VCF file parse/export
├── features/
│   ├── auto-merger.js     # Duplicate detection queue
│   ├── duplicate-preview.js # Pre-merge preview modal
│   └── merge-tool.js      # Merge/edit modal UI
└── utils/
    ├── html.js            # XSS escaping, color validation
    ├── phone.js           # Phone normalization
    └── toast.js           # Toast notification system
```

| File | Edit when... |
|------|--------------|
| `config.js` | Adding settings, messages, defaults |
| `contacts.js` | Changing state, selection, render, filter/sort |
| `vcf-parser.js` | Adding VCF fields, changing parse/export |
| `auto-merger.js` | Adding duplicate detection methods |
| `merge-tool.js` | Changing merge UI, field editing |
| `phone.js` | Supporting new country codes, formats |
| `app.js` | Adding new global instances |

## Development Workflow

```bash
cd vcf-manager
npm install              # Dev dependencies only
npm test                 # Establish baseline
# ... make changes ...
npm test                 # Verify changes
npm run test:coverage    # Check coverage
```

## Coding Standards

- Classes: `PascalCase` | Functions: `camelCase` | Private: `_camelCase`
- All files use ES module syntax (`import`/`export`)
- JSDoc on all public methods: `@param`, `@returns`
- Tests in `tests/` mirror `src/` structure (Arrange, Act, Assert)

## Common Patterns

### Adding a New Contact Field
1. `vcf-parser.js`: Add to `_parseBlock()` and `export()`
2. `merge-tool.js`: Add to `buildPending()` and `renderResultForm()`
3. `tests/`: Add parsing and merge tests

### Adding Duplicate Detection Method
1. `auto-merger.js`: Add `_findDuplicatesBy*()` method
2. `auto-merger.js`: Update `start()` to handle new mode
3. `index.html`: Add button with `onclick="autoMerger.start('mode')"`
4. `tests/`: Add detection tests

## Common Pitfalls

1. **Breaking window globals** -- `core`, `mergeTool`, `autoMerger` are used in HTML onclick handlers
2. **State without render** -- After modifying `core.contacts`, call `core.render()`
3. **Missing DOM checks** -- Always check `if (element)` before using DOM elements
4. **Adding dependencies** -- Keep the app dependency-free for production
5. **Breaking no-build** -- Don't introduce transpilation or bundling

## Decision-Making

- **Add code** when it solves a real user problem with minimal complexity (YAGNI)
- **Refactor** when it reduces complexity, not just to change style
- **Prefer**: simplest solution > less code > browser-native APIs > testable approaches
- **Red flags**: new libraries, build steps, single-use abstractions, multi-file changes

## Pre-Commit Checklist

- [ ] All tests pass (`npm test`)
- [ ] No console errors in browser
- [ ] JSDoc updated for changed functions
- [ ] No debug code left behind

## Pull Requests

**Title**: `<Type>: <Brief description>` (under 72 chars)

**Description must include**:
1. Summary of what changed and why
2. Screenshots for any UI change (before/after)
3. Test results (e.g., "320 tests passing")

Keep PRs focused -- one logical change per PR. Link related issues. Explain trade-offs.
