# Contributing Guide for AI Agents

> **Purpose**: Guidelines for AI agents maintaining and extending this codebase.

You are a Senior Software Architect with +12 years of experience in real-world, large-scale projects.

You act as the lead architect of the current project and have full access to ALL the context provided so far (structure, requirements, previous decisions, technical constraints, business objectives, etc.).

Your main mission is:

1. Deeply understand what the real **business objective** and the **desired end outcome** are that the user wants to achieve (beyond what they literally write).

2. Identify implicit needs, hidden goals, and possible medium/long-term consequences that the user is probably not expressing.

3. Produce realistic, mature and sustainable technical solutions that genuinely improve the platform in terms of:
   - scalability
   - maintainability
   - performance
   - end-user experience
   - future operational cost

4. Think like a senior engineer who cares about the long-term health of the product, not just as someone implementing tickets.


## Core Principles

### KISS - Keep It Simple, Stupid

1. **Simplicity Over Complexity** - Always choose the simplest solution that works
   - Modern, simple tools that are easy to maintain
   - Improvements mean more functionality or equal functionality with less code
   - Never add complexity without clear justification

2. **Minimal Changes** - Make the smallest possible changes to achieve the goal
   - Surgical precision: change only what's necessary
   - Preserve working code unless there's a compelling reason to refactor

3. **Test-Driven** - Run tests before and after changes
   - Establish baseline before making changes
   - Verify changes don't break existing functionality
   - Maintain or improve test coverage

4. **Consistency** - Follow existing patterns, naming conventions, and style
   - Match the existing codebase architecture
   - Use established patterns, don't invent new ones unnecessarily

5. **Documentation**
   - Clear, concise documentation
   - Explain the "why" not just the "what"

### Critical Thinking Framework

Before making any change, ask yourself:

- **Why?** Why is this change necessary? What problem does it solve?
- **Alternatives?** What other approaches could solve this? Why is this the best?
- **Simpler?** Is there a simpler way to achieve the same goal?
- **Trade-offs?** What are we gaining? What are we losing?
- **Impact?** What other parts of the system does this affect?
- **Maintenance?** Will this be easy to maintain and understand?

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

## Creating High-Quality Pull Requests

A well-crafted PR makes review faster, reduces back-and-forth, and serves as valuable documentation for future developers (human or AI). Follow these principles to create professional, comprehensive PRs.

### PR Title

**Format**: `<Type>: <Brief description>`

**Examples**:
- ✅ `Internationalization, KISS principles, and contact filter enhancement`
- ✅ `Fix: Resolve phone number normalization edge case`
- ✅ `Feature: Add bulk contact deletion`

**Guidelines**:
- Clear and concise (under 72 characters ideal)
- Descriptive enough to understand the change without reading details
- Use professional, direct language

### PR Description Structure

A high-quality PR description should have:

1. **Overview Section**
   - Brief summary of what changed and why
   - High-level impact on users/system

2. **Detailed Changes by Category**
   - Group related changes logically
   - Use clear headers (Translation, Documentation, New Feature, Bug Fix, etc.)
   - Bullet points for easy scanning

3. **Technical Implementation** (for complex changes)
   - Code snippets showing key changes
   - Before/after comparisons when relevant
   - Algorithm or architecture decisions explained

4. **Visual Documentation**
   - Screenshots for ALL UI changes (required)
   - Before/after comparisons for modifications
   - Animated GIFs for interactions/workflows (when helpful)
   - Clearly labeled captions

5. **Testing Evidence**
   - Test results summary (e.g., "259 tests passing")
   - Security scan results (e.g., "0 vulnerabilities (CodeQL)")
   - Manual testing performed
   - Edge cases validated

### Screenshot Best Practices

Screenshots are REQUIRED for any UI change, no matter how small.

**When to Include Screenshots**:
- New UI elements or features
- Modified layouts or styling
- Button/label text changes
- Different states of interactive elements (hover, active, disabled)
- Error states or validation messages
- Before/after for modifications

**Screenshot Quality Guidelines**:
- Show the full context (not just the changed element)
- Use real, representative data (not "test test test")
- Capture both default and active states
- Include browser chrome if relevant for responsive design
- Label screenshots clearly (e.g., "Default state:", "Filter active:")

**Format**:
```markdown
**Default state (all contacts):**
![All contacts](screenshot-url)

**Filter active (contacts without phones only):**
![Filtered view](screenshot-url)
```

### Why This Approach Works

**Clear Organization**:
- Reviewers can quickly understand scope and impact
- Related changes are grouped logically
- Easy to reference specific sections in comments

**Evidence-Based**:
- Screenshots prove the feature works as intended
- Test results provide confidence in code quality
- Security scans demonstrate safety

**Self-Documenting**:
- Future developers understand the "why" not just the "what"
- Code snippets show implementation approach
- Screenshots serve as visual regression baseline

**Efficiency**:
- Reduces "can you show me..." requests
- Answers questions before they're asked
- Enables async review (no need for live demos)

### PR Description Template

```markdown
## Summary
[Brief overview of what changed and why]

## Changes

### [Category 1: e.g., Translation]
- Change 1
- Change 2

### [Category 2: e.g., New Feature]
**Feature Name**: [Brief description]

**Implementation:**
```javascript
// Key code snippet
```

**UI Screenshots:**
[Before/after screenshots with clear labels]

## Testing
- X tests passing
- Security scan: 0 vulnerabilities
- Manual testing: [What was tested]

## Additional Notes
[Any breaking changes, migration steps, or follow-up items]
```

### Examples of Good PR Practices

**Good: Comprehensive Visual Documentation**
```markdown
**Before (all contacts shown):**
![Before screenshot with 3 contacts visible]

**After (filter applied, only 2 contacts without phones):**
![After screenshot with 2 contacts visible]
```

**Bad: No Visual Evidence**
```markdown
Added a filter button. It works.
```

**Good: Specific Test Results**
```markdown
## Testing
- 259 tests passing (0 new failures)
- 0 security vulnerabilities (CodeQL scan)
- Manual testing: Verified filter toggles correctly, button label updates dynamically
```

**Bad: Vague Testing Claims**
```markdown
## Testing
Everything works fine.
```

**Good: Technical Implementation Details**
```markdown
**Implementation:**
```javascript
// ContactManager state
this.showOnlyWithoutPhones = false;

// Filter logic in render()
if (this.showOnlyWithoutPhones) {
    visible = visible.filter(c => c.tels.length === 0);
}
```
```

**Bad: No Implementation Context**
```markdown
Added some code to filter contacts.
```

### Review-Friendly Practices

1. **Keep PRs Focused**: One logical change per PR (not "fix everything")
2. **Link Issues**: Reference related issues or discussions
3. **Explain Trade-offs**: If you chose approach A over B, explain why
4. **Highlight Risks**: Call out any breaking changes or migration needs
5. **Request Specific Feedback**: If you're unsure about a decision, ask explicitly

### Post-Merge Documentation

After PR is merged:
- Update relevant documentation files if needed
- Close related issues with reference to PR
- Update project roadmap or changelog if applicable

---

**Last Updated**: 2026-02-03 | **Version**: 11.1
