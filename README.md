# VCF Manager

![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Run%20Tests/badge.svg)

A modern, modular contact management application for VCF (vCard) files with duplicate detection and merging capabilities.

**🌐 Live Demo**: [https://antoniosegoviaexposito.github.io/copilotTesting/](https://antoniosegoviaexposito.github.io/copilotTesting/)

**📊 Test Reports**: [https://antoniosegoviaexposito.github.io/copilotTesting/reports.html](https://antoniosegoviaexposito.github.io/copilotTesting/reports.html)

**📈 Code Coverage**: [https://antoniosegoviaexposito.github.io/copilotTesting/coverage/](https://antoniosegoviaexposito.github.io/copilotTesting/coverage/)

## 📖 Features

- **Import/Export** - Parse and generate VCF (vCard) contact files
- **Duplicate Detection** - Automatic detection by name or phone number
- **Contact Merging** - Manual and automatic merge capabilities
- **Search & Filter** - Real-time contact search
- **Clean UI** - Modern, responsive single-page application

## 🚀 Quick Start

```bash
# Navigate to project directory
cd vcf-manager

# Install dependencies
npm install

# Run tests
npm test

# Open application
# Open index.html in a web browser (use a local HTTP server for best results)
```

## 🏗️ Architecture

This project follows standard JavaScript best practices:

- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **Modular Design** - Clear separation of concerns (core, features, utilities)
- **Comprehensive Testing** - Jest with 197 passing tests and 97.98% coverage
- **Clean Code** - JSDoc comments, consistent naming, clear structure
- **Modern Test Reporting** - Beautiful, minimalist test and coverage reports

### Project Structure

```
vcf-manager/
├── index.html           # Application entry point
├── package.json         # NPM dependencies and scripts
├── jest.config.js       # Test configuration with modern reporters
├── css/
│   └── styles.css       # Application styles
├── src/
│   ├── app.js          # Application initialization
│   ├── config.js       # Configuration and constants
│   ├── core/           # Core business logic
│   │   ├── contacts.js    # Contact management
│   │   └── vcf-parser.js  # VCF parsing/export
│   ├── features/       # Feature modules
│   │   ├── auto-merger.js # Auto-merge functionality
│   │   └── merge-tool.js  # Manual merge UI
│   └── utils/          # Utility functions
│       └── phone.js       # Phone number handling
└── tests/              # Test suites
    ├── core/          # Core module tests
    │   ├── contacts.test.js
    │   ├── contacts-init.test.js
    │   ├── vcf-parser.test.js
    │   └── vcf-parser-edge-cases.test.js
    ├── features/      # Feature tests
    │   ├── auto-merger.test.js
    │   └── merge-tool.test.js
    ├── utils/         # Utility tests
    │   ├── phone.test.js
    │   └── phone-edge-cases.test.js
    └── integration.test.js  # Integration tests
```

## 🧪 Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

### Test Suite Statistics

- **Total Tests**: 197 tests passing
- **Test Suites**: 9 test suites
- **Code Coverage**: 97.98% overall
  - Statements: 97.98%
  - Branches: 87.43%
  - Functions: 98.98%
  - Lines: 99.66%

### Modern Test Reporting

This project uses modern, minimalist test reporting tools:

- **jest-html-reporters** - Beautiful, interactive HTML test reports
- **Istanbul/NYC** - Comprehensive code coverage analysis
- **Modern UI** - Clean, dark-themed reports with excellent readability

View the reports online:
- [Test Report](https://antoniosegoviaexposito.github.io/copilotTesting/test-report/)
- [Coverage Report](https://antoniosegoviaexposito.github.io/copilotTesting/coverage/)
- [Reports Dashboard](https://antoniosegoviaexposito.github.io/copilotTesting/reports.html)

### Test Categories

1. **Unit Tests** - Individual module functionality
   - Phone utilities with edge cases (26 tests)
   - VCF parser with edge cases (28 tests)
   - Contact manager (88 tests)
   - Auto-merger (36 tests)
   - Merge tool (17 tests)

2. **Integration Tests** - Complete workflows (14 tests)
   - Import/export cycles
   - Merge workflows
   - Auto-merge operations
   - Filter and selection

### Continuous Integration

This project uses GitHub Actions for automated testing and deployment:
- Tests run automatically on all pull requests
- Tests run on push to main branch
- Test reports are generated and published to GitHub Pages
- **GitHub Pages**: Automatically deployed from `/docs` directory on push to main
- **Test Reports**: Modern test results published to `/test-report` path
- **Coverage Reports**: Test coverage published to `/coverage` path

See [.github/workflows/README.md](.github/workflows/README.md) for more details.

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture and design patterns
- **[CONTRIBUTING_FOR_AI.md](CONTRIBUTING_FOR_AI.md)** - Development guidelines for AI-assisted development
- **[CODE_STRUCTURE.md](CODE_STRUCTURE.md)** - Complete file structure reference
- **[.github/workflows/README.md](.github/workflows/README.md)** - GitHub Actions workflows documentation

## 🔧 Configuration

Configuration options are centralized in `src/config.js`:

- Application metadata (version, name)
- Phone number format settings
- UI display preferences
- User-facing messages

## 📊 Code Quality Standards

- JSDoc documentation for all functions and classes
- Consistent code style and naming conventions
- High test coverage (197 tests, 97.98% coverage)
- Modular architecture with clear dependencies
- No external runtime dependencies (testing only)
- Modern, minimalist test reporting

## 📝 Version

**Current Version**: 11.1

## 📄 License

MIT License