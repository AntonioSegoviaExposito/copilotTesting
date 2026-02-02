# VCF Manager

A modern contact management application for VCF (vCard) files with duplicate detection and merging capabilities.

## 📁 Project Structure

```
vcf-manager/
├── index.html              # Application entry point
├── package.json            # Dependencies and scripts
├── vitest.config.js        # Vitest test configuration
├── css/
│   └── styles.css          # Application styles
├── src/
│   ├── app.js             # Application initialization
│   ├── config.js          # Configuration
│   ├── core/
│   │   ├── contacts.js    # Contact state management
│   │   └── vcf-parser.js  # VCF parsing/export
│   ├── features/
│   │   ├── auto-merger.js # Duplicate detection
│   │   └── merge-tool.js  # Manual merge UI
│   └── utils/
│       └── phone.js       # Phone number utilities
└── tests/                 # Vitest test suites
```

## 🛠️ Technology Stack

- **Core**: Vanilla JavaScript (ES6+)
- **UI**: HTML5 + CSS3 (CSS Variables)
- **Testing**: Vitest with jsdom
- **No framework dependencies** - Pure JavaScript implementation

## ⚡ Commands

```bash
npm install           # Install dependencies
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

## 📊 Test Coverage

152+ passing tests covering all core functionality.

## 📄 License

MIT License
