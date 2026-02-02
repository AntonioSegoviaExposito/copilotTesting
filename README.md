# VCF Manager

![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Run%20Tests/badge.svg)

A modern, modular contact management application for VCF (vCard) files with duplicate detection and merging capabilities.

**🌐 Live Demo**: [https://antoniosegoviaexposito.github.io/copilotTesting/](https://antoniosegoviaexposito.github.io/copilotTesting/)

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
- **Comprehensive Testing** - Jest with 152+ passing tests
- **Clean Code** - JSDoc comments, consistent naming, clear structure

### Project Structure

```
vcf-manager/
├── index.html           # Application entry point
├── package.json         # NPM dependencies and scripts
├── jest.config.js       # Test configuration
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
    ├── features/      # Feature tests
    └── utils/         # Utility tests
```

## 🧪 Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

All features include comprehensive unit and integration tests.

### Continuous Integration

This project uses GitHub Actions for automated testing:
- Tests run automatically on all pull requests
- Tests run on push to main branch
- Coverage reports are generated and available as artifacts

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
- High test coverage (152+ tests)
- Modular architecture with clear dependencies
- No external runtime dependencies (testing only)

## 📝 Version

**Current Version**: 11.1

## 📄 License

MIT License