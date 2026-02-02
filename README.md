# VCF Manager

![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Test%20%26%20Deploy/badge.svg)

> **⚠️ AI-Generated & Maintained**: This project is generated and maintained by AI agents. Code quality, architecture decisions, and documentation are continuously optimized through automated processes.

A modern contact management application for VCF (vCard) files with duplicate detection and merging.

**Live Demo**: https://antoniosegoviaexposito.github.io/copilotTesting/

**Coverage Report**: https://antoniosegoviaexposito.github.io/copilotTesting/coverage/

## Features

- **Import/Export** - Parse and generate VCF (vCard) files
- **Duplicate Detection** - Find duplicates by name or phone number
- **Contact Merging** - Manual and automatic merge with master/slave pattern
- **Search & Filter** - Real-time contact search
- **Clean UI** - Modern, responsive dark-themed interface

## Quick Start

```bash
cd vcf-manager
npm install
npm test
```

Open `index.html` in a browser (or use a local HTTP server).

## Project Structure

```
vcf-manager/
├── index.html              # App entry (ES module loader)
├── css/styles.css          # Styles
├── src/
│   ├── app.js              # Bootstrap, exposes globals to window
│   ├── config.js           # App settings
│   ├── core/
│   │   ├── contacts.js     # Contact management, UI rendering
│   │   └── vcf-parser.js   # VCF parse/export
│   ├── features/
│   │   ├── auto-merger.js  # Duplicate detection queue
│   │   └── merge-tool.js   # Merge modal UI
│   └── utils/
│       └── phone.js        # Phone normalization
└── tests/                  # Vitest test suites
```

## Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**259 tests** | **99.87% coverage** | Vitest + V8

## Architecture

- **Vanilla ES6+ modules** - No framework dependencies
- **ES module imports** - Proper `import`/`export` syntax
- **Window globals** - `core`, `mergeTool`, `autoMerger` exposed for HTML onclick handlers
- **Single workflow CI** - Tests on PR, deploys on push to main

### Module Dependencies

```
config.js (no deps)
    ↓
phone.js → config
    ↓
vcf-parser.js → config, phone
    ↓
contacts.js → config, phone, vcf-parser
    ↓
merge-tool.js → phone (uses window.core, window.autoMerger)
auto-merger.js → config, phone (uses window.core, window.mergeTool)
    ↓
app.js → imports all, exposes to window, calls init()
```

## Configuration

Edit `src/config.js`:

```javascript
const Config = {
    version: '11.1',
    phone: {
        defaultCountryCode: '+34',  // Change for your country
        minLength: 9
    },
    ui: {
        maxTelsDisplay: 3
    },
    messages: { /* user-facing strings */ }
};
```

## License

MIT
