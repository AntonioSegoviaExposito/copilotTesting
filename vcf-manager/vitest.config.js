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
    
    // Coverage with v8 (faster than Istanbul)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
      exclude: ['src/app.js'],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90
      }
    },
    
    // Reporters for better output
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-report/index.html'
    }
  }
});
