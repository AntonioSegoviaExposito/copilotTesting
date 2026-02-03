# TODO Issues Breakdown - VCF Manager

This document provides detailed breakdown of the TODO items from Issue #16, ready to be created as separate GitHub issues.

---

## Issue 1: Prevent Empty Contact Creation

**Title:** Validate contact data before creation when using "Add Contact" feature

**Priority:** High  
**Type:** Bug/Enhancement  
**Component:** Contact Management (src/core/contacts.js)

### Problem Description

Currently, when a user clicks the "Add Contact" button and opens the merge tool modal without entering any data (no name, no phone numbers, no emails), the contact is still created and saved when the modal is closed or confirmed. This results in empty/useless contacts cluttering the contact list.

### Current Behavior

1. User clicks "➕ Add Contact" button
2. Modal opens with empty form
3. User clicks "Cancel" or "✅ CONFIRM CHANGES" without entering any data
4. Empty contact is created with only an ID and empty fields

### Expected Behavior

When creating a new contact through the "Add Contact" feature:
- If the user cancels without entering any data, the contact creation should be cancelled
- If the user confirms without entering at least a name OR phone number OR email, the operation should be cancelled with a warning message
- Only contacts with meaningful data should be added to the contact list

### Technical Details

**Location:** `vcf-manager/src/core/contacts.js` - `addNewContact()` method (lines ~886-911)

**Related Components:**
- `vcf-manager/src/features/merge-tool.js` - `commit()` and `close()` methods
- Modal UI in `index.html` (lines 69-115)

**Suggested Implementation:**

1. Add a flag to track if contact is new (e.g., `_isNewContact: true`)
2. In `mergeTool.commit()` or `mergeTool.close()`, check if contact is new and has no meaningful data
3. Define "meaningful data" as: `fn` (name) is not empty OR `tels` array has at least one element OR `emails` array has at least one element
4. If validation fails:
   - Show a toast message: "Cannot create empty contact. Please add at least a name, phone number, or email."
   - Remove the empty contact from the contacts array
   - Close the modal

### Testing Requirements

- Unit test: Create new contact and cancel without data → contact should not be in list
- Unit test: Create new contact with only name → contact should be created
- Unit test: Create new contact with only phone → contact should be created
- Unit test: Create new contact with only email → contact should be created
- Integration test: Full workflow through UI

### User Impact

- Prevents accidental creation of empty contacts
- Keeps contact list clean and organized
- Improves user experience with clear feedback

---

## Issue 2: Visual Indicator for "No Phone" Filter Active State

**Title:** Add pulsing red visual indicator when "No Phone" filter is active

**Priority:** Medium  
**Type:** Enhancement  
**Component:** UI/UX - Contact Filtering

### Problem Description

When the "No Phone" filter is active (showing only contacts without phone numbers), users may not realize the filter is active, especially after returning to the application or switching tasks. There's no prominent visual indicator beyond the button text change.

### Current Behavior

1. User clicks "📵 No Phone" button
2. Button text changes to "📵 Show All"
3. Contact list filters to show only contacts without phones
4. No additional visual feedback to indicate an active filter

### Expected Behavior

When "No Phone" filter is active:
- The button should have a slow pulsing/blinking red effect
- The pulsing should be subtle but noticeable (approximately 2-second cycle)
- The effect should clearly communicate that a filter is currently active
- When filter is deactivated, the pulsing effect should stop

### Technical Details

**Location:** 
- `vcf-manager/src/core/contacts.js` - `togglePhoneFilter()` method (lines ~460-474)
- `vcf-manager/css/styles.css` - Add new CSS animation
- `vcf-manager/index.html` - Button at line 29

**Suggested Implementation:**

1. **CSS Animation:** Add a pulsing animation in `styles.css`:
```css
@keyframes pulse-red {
    0%, 100% {
        background-color: var(--danger);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    50% {
        background-color: #dc2626;
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
}

.btn-pulse-red {
    animation: pulse-red 2s ease-in-out infinite;
}
```

2. **JavaScript Update:** In `togglePhoneFilter()` method:
```javascript
togglePhoneFilter() {
    this.showOnlyWithoutPhones = !this.showOnlyWithoutPhones;
    this.render();
    
    const toggleBtn = document.getElementById('btnTogglePhones');
    if (toggleBtn) {
        if (this.showOnlyWithoutPhones) {
            toggleBtn.innerText = '📵 Show All';
            toggleBtn.classList.add('btn-pulse-red');
        } else {
            toggleBtn.innerText = '📵 No Phone';
            toggleBtn.classList.remove('btn-pulse-red');
        }
    }
}
```

### Design Considerations

- Animation should be smooth and not jarring
- Red color appropriate for "warning" state (filter active)
- Pulse cycle should be slow (2s) to avoid distraction
- Animation should be performant (CSS-based, not JavaScript)
- Consider accessibility: ensure sufficient contrast and don't rely solely on animation

### Testing Requirements

- Visual test: Verify pulsing animation appears when filter is active
- Visual test: Verify animation stops when filter is deactivated
- Unit test: Check CSS class is added/removed correctly
- Integration test: Filter functionality remains intact with new visual indicator
- Performance test: Ensure animation doesn't impact performance

### User Impact

- Improved awareness of active filters
- Reduced confusion when contact list appears empty or incomplete
- Better UX with clear visual feedback

---

## Issue 3: Hide or Repurpose Empty Source Column in New Contact Modal

**Title:** Optimize modal layout for single-contact operations (Add New Contact)

**Priority:** Medium  
**Type:** Enhancement  
**Component:** UI/UX - Merge Tool Modal

### Problem Description

The merge tool modal (`index.html` lines 69-115) is designed for merging multiple contacts, showing a "SOURCES" column on the left and "FINAL RESULT" column on the right. When used for adding a new contact (only one contact, no sources to merge), the left "SOURCES" column appears blank/empty, wasting valuable screen space and creating a confusing UI.

### Current Behavior

1. User clicks "➕ Add Contact"
2. Modal opens with two columns:
   - Left column (SOURCES): Shows empty state or single new contact
   - Right column (FINAL RESULT): Shows editable form
3. Left column serves no purpose in this context

### Expected Behavior

When modal is used for single-contact operations (new contact or single contact edit):
- The "SOURCES" column should be hidden
- The "FINAL RESULT" form should expand to use full modal width
- Modal should adapt its layout based on number of source contacts

### Technical Details

**Location:**
- `vcf-manager/src/features/merge-tool.js` - Modal rendering logic
- `vcf-manager/index.html` - Modal structure (lines 69-115)
- `vcf-manager/css/styles.css` - Modal layout styles

**Suggested Implementation Options:**

**Option A: Conditional Column Display**
```javascript
// In merge-tool.js init() or render method
const sourcesList = document.getElementById('mergeSourcesList');
const sourcesCol = document.querySelector('.col-sources');

if (this.pending.originalObjects.length === 1) {
    sourcesCol.style.display = 'none';
    // Add CSS class to expand result column
    resultCol.classList.add('col-result-full-width');
} else {
    sourcesCol.style.display = '';
    resultCol.classList.remove('col-result-full-width');
}
```

**Option B: Simplified Single-Contact View**
- Show source contact as a compact preview card at the top
- Remove the full sources column
- Provide clear visual hierarchy

**Option C: Change Modal Title and Instructions**
- Keep current layout but update modal title to "Add New Contact" vs "Merge Contacts"
- Provide helpful instructions in empty source area

### CSS Changes Needed

```css
.col-result-full-width {
    max-width: 100%;
    flex: 1;
}

.modal-body.single-contact-mode .col-sources {
    display: none;
}
```

### Testing Requirements

- Visual test: New contact modal should show optimized layout
- Visual test: Merge modal (multiple contacts) should show both columns
- Unit test: Layout switches correctly based on contact count
- Integration test: All modal functions work with both layouts
- Responsive test: Layout works on mobile/tablet screens

### User Impact

- Better use of screen space
- Cleaner, less confusing UI for adding new contacts
- Maintains full functionality for merge operations
- More professional appearance

---

## Issue 4: Implement Performance Monitoring and Detection

**Title:** Add performance monitoring for CPU usage and infinite loop detection

**Priority:** Medium  
**Type:** Enhancement/DevOps  
**Component:** Testing & Monitoring

### Problem Description

The application currently lacks performance monitoring capabilities to detect:
- Functions with infinite loops or excessive iterations
- High CPU usage due to unexpected JavaScript behavior
- Performance degradation in production
- Resource-intensive operations that could freeze the UI

This is particularly important for:
- Contact list operations with large datasets (1000+ contacts)
- Duplicate detection algorithms
- VCF parsing of large files
- Real-time search/filter operations

### Current State

- No performance metrics collection
- No runtime monitoring
- No detection of problematic code paths
- Limited performance testing in test suite

### Expected Capabilities

**Development Environment:**
- Detect slow-running functions during tests
- Alert on functions exceeding time thresholds
- Identify infinite or near-infinite loops
- Profile CPU usage during operations

**Production Environment:**
- Optional performance monitoring (opt-in)
- Error reporting for performance issues
- Graceful handling of performance problems

### Technical Details

**Suggested Implementation:**

**1. Performance Testing Framework**

Create `vcf-manager/tests/performance.test.js`:

```javascript
import { describe, it, expect } from 'vitest';

describe('Performance Tests', () => {
    it('should parse 1000 contacts in under 1 second', () => {
        const start = performance.now();
        // Parse large VCF file
        const end = performance.now();
        expect(end - start).toBeLessThan(1000);
    });
    
    it('should detect duplicates in under 2 seconds', () => {
        // Test duplicate detection performance
    });
    
    it('should render 1000 contacts in under 500ms', () => {
        // Test rendering performance
    });
});
```

**2. Runtime Performance Guard**

Create `vcf-manager/src/utils/performance-guard.js`:

```javascript
export class PerformanceGuard {
    static wrapFunction(fn, name, timeoutMs = 5000) {
        return function(...args) {
            const start = performance.now();
            let timeoutId;
            
            const checkTimeout = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error(`Function ${name} exceeded ${timeoutMs}ms`));
                }, timeoutMs);
            });
            
            const result = fn.apply(this, args);
            clearTimeout(timeoutId);
            
            const duration = performance.now() - start;
            if (duration > timeoutMs * 0.8) {
                console.warn(`Performance warning: ${name} took ${duration}ms`);
            }
            
            return result;
        };
    }
    
    static monitorLoop(maxIterations = 10000) {
        let count = 0;
        return () => {
            count++;
            if (count > maxIterations) {
                throw new Error(`Loop exceeded ${maxIterations} iterations`);
            }
        };
    }
}
```

**3. Integration with Existing Code**

Wrap performance-critical functions:
- `ContactManager.render()`
- Duplicate detection algorithms
- VCF parsing functions
- Search/filter operations

**4. Monitoring Dashboard (Optional)**

Add a dev-mode panel showing:
- Function execution times
- Memory usage
- Warning flags for slow operations

### Testing Requirements

- Performance test suite covering key operations
- Benchmarks for comparison across changes
- CI integration to catch performance regressions
- Load testing with large datasets (1000+, 5000+, 10000+ contacts)

### Tools & Libraries

Consider integrating:
- **Vitest** (already used): Built-in performance testing
- **web-vitals**: Core Web Vitals metrics
- **performance.mark/measure**: Native browser APIs
- **Performance Observer API**: Monitor long tasks

### User Impact

- Prevents application freezes
- Early detection of performance issues
- Better experience with large contact lists
- Confidence in app stability

### Implementation Phases

**Phase 1:** Basic performance test suite
**Phase 2:** Runtime guards on critical functions  
**Phase 3:** Performance monitoring dashboard
**Phase 4:** Production telemetry (optional)

---

## Issue 5: Enhance Test Coverage and Error Detection

**Title:** Improve error detection across integration, unit, performance, and visual tests

**Priority:** High  
**Type:** Testing Infrastructure  
**Component:** Testing Framework

### Problem Description

While the project has excellent test coverage (99.87% according to README), there are opportunities to improve error detection capabilities across different testing dimensions:

1. **Integration Tests:** Better coverage of user workflows and edge cases
2. **Unit Tests:** More thorough error condition testing
3. **Performance Tests:** Currently minimal or non-existent
4. **Visual Tests:** No visual regression testing

### Current State

**Strengths:**
- 320 tests with 99.87% code coverage
- Vitest + V8 coverage
- Good unit test structure

**Gaps:**
- Limited integration test scenarios
- Missing performance test suite
- No visual regression tests
- Error scenarios may be under-tested
- Edge case coverage could be improved

### Expected Improvements

**1. Enhanced Integration Tests**

Expand `vcf-manager/tests/integration.test.js`:

```javascript
describe('Integration Tests - Error Scenarios', () => {
    it('should handle corrupted VCF files gracefully', () => {
        // Test malformed VCF import
    });
    
    it('should handle extremely large contact lists (10000+)', () => {
        // Test performance with large datasets
    });
    
    it('should prevent data loss on browser crash', () => {
        // Test localStorage recovery
    });
    
    it('should handle concurrent merge operations', () => {
        // Test race conditions
    });
    
    it('should validate user input and prevent XSS', () => {
        // Security testing
    });
});

describe('Integration Tests - User Workflows', () => {
    it('should complete full import → dedupe → merge → export workflow', () => {
        // End-to-end workflow
    });
    
    it('should handle undo operations correctly', () => {
        // Test undo/redo if implemented
    });
});
```

**2. Unit Tests - Error Conditions**

Add comprehensive error testing:

```javascript
describe('Error Handling', () => {
    it('should throw descriptive errors for invalid input', () => {
        expect(() => parseVCF(null)).toThrow('Invalid VCF data');
    });
    
    it('should recover from parsing errors', () => {
        // Test graceful degradation
    });
    
    it('should validate phone numbers strictly', () => {
        // Test phone validation edge cases
    });
});

describe('Edge Cases', () => {
    it('should handle empty strings in all fields', () => {});
    it('should handle unicode and special characters', () => {});
    it('should handle maximum field lengths', () => {});
    it('should handle null and undefined gracefully', () => {});
});
```

**3. Performance Test Suite**

Create `vcf-manager/tests/performance.test.js` (see Issue 4 for details):
- Benchmark critical operations
- Test with varying dataset sizes
- Monitor memory usage
- Detect performance regressions

**4. Visual Regression Tests**

Implement visual testing with tools like:
- **Playwright** for screenshot comparison and browser automation
- **Percy** or **Chromatic** for visual diffs (if budget allows)
- **pixelmatch** for local image comparison

Example structure:
```javascript
// vcf-manager/tests/visual.test.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
    test('should match contact card snapshot', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.contact-card').first()).toHaveScreenshot('contact-card.png');
    });
    
    test('should match modal layout snapshot', async ({ page }) => {
        await page.goto('/');
        await page.click('button:has-text("Add Contact")');
        await expect(page.locator('.modal')).toHaveScreenshot('modal-layout.png');
    });
    
    test('should maintain responsive design', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // Mobile
        await page.goto('/');
        await expect(page).toHaveScreenshot('mobile-view.png');
    });
});
```

**Playwright Configuration:**
```javascript
// vcf-manager/playwright.config.js (create if doesn't exist)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    // Using relative URLs (/) with baseURL configured
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173, // Should match baseURL port
    reuseExistingServer: !process.env.CI,
  },
});
```

**5. Test Utilities & Helpers**

Create test helpers:

```javascript
// vcf-manager/tests/helpers/test-data.js
export const TestData = {
    createContact(overrides) {
        return { fn: 'Test User', tels: [], emails: [], ...overrides };
    },
    
    createManyContacts(count) {
        return Array.from({ length: count }, (_, i) => 
            this.createContact({ fn: `Contact ${i}` })
        );
    },
    
    createVCFString(contacts) {
        // Generate VCF test data
    }
};

// vcf-manager/tests/helpers/assertions.js
export const customMatchers = {
    toBeValidContact(contact) {
        // Custom assertion for contact validation
    },
    
    toHaveNoDuplicates(array) {
        // Custom assertion for duplicate detection
    }
};
```

### Implementation Plan

**Phase 1: Audit Current Tests** (1-2 days)
- Review existing tests for gaps
- Identify untested error scenarios
- List edge cases needing coverage

**Phase 2: Enhance Unit Tests** (2-3 days)
- Add error condition tests
- Add edge case tests
- Improve test organization

**Phase 3: Expand Integration Tests** (2-3 days)
- Add workflow tests
- Add error scenario tests
- Add concurrent operation tests

**Phase 4: Add Performance Tests** (3-4 days)
- Set up performance test framework
- Create benchmarks
- Add to CI pipeline

**Phase 5: Add Visual Tests** (3-5 days)
- Choose visual testing tool
- Set up infrastructure
- Create initial test suite

### Success Metrics

- Maintain 99%+ code coverage
- 100% of critical paths tested
- All error conditions have tests
- Performance benchmarks in place
- Visual regression tests for UI components
- CI catches issues before merge

### Tools & Dependencies

- **Vitest** (existing): Unit and integration tests with built-in benchmarking
- **Playwright**: Visual regression testing
- **istanbul/v8**: Coverage reporting
- **Performance API** (native): Browser performance monitoring
- **MSW** (Mock Service Worker): API mocking if needed

### User Impact

- Higher quality releases
- Fewer bugs in production
- Faster issue detection
- More confidence in changes
- Better developer experience

---

## Summary

These five issues represent key improvement areas for the VCF Manager application:

1. **Issue 1 (High Priority):** Prevents empty contact creation - immediate UX improvement
2. **Issue 2 (Medium Priority):** Visual feedback for active filters - better UX clarity  
3. **Issue 3 (Medium Priority):** Optimized modal layout - professional appearance
4. **Issue 4 (Medium Priority):** Performance monitoring - stability and reliability
5. **Issue 5 (High Priority):** Enhanced testing - long-term quality and maintainability

**Recommended Implementation Order:**
1. Issue 1 (Quick win, high impact)
2. Issue 5 (Foundation for other changes)
3. Issue 2 (Simple, visible improvement)
4. Issue 3 (UI polish)
5. Issue 4 (Advanced monitoring)

Each issue can be tackled independently, allowing for incremental progress and staged deployment.
