import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom',
    
    // Test files
    include: ['tests/**/*.test.js'],
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
    
    // Globals (describe, test, expect, vi)
    globals: true,
    
    // Reporters for better output
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-report/index.html'
    }
  }
});
