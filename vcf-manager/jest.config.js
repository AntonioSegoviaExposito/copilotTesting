module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-report',
        filename: 'index.html',
        pageTitle: 'VCF Manager Test Report',
        expand: true,
        openReport: false,
        darkTheme: false
      }
    ]
  ],
  verbose: true
};
