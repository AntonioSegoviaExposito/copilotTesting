# VCF Manager

![Tests](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Test%20%26%20Deploy/badge.svg)

> **⚠️ AI-Generated & Maintained**: This project is generated and maintained by AI agents. Code quality, architecture decisions, and documentation are continuously optimized through automated processes.

A modern contact management application for VCF (vCard) files with duplicate detection and merging.

**Live Demo**: https://antoniosegoviaexposito.github.io/copilotTesting/

**Coverage Report**: https://antoniosegoviaexposito.github.io/copilotTesting/coverage/

## Features

- **Import/Export** - Parse and generate VCF (vCard) files with full vCard 4.0 support
- **vCard 4.0 Support** - Modern vCard format with GENDER, ANNIVERSARY, KIND, LANG fields
- **Backward Compatibility** - Import vCard 3.0 files and export to either 3.0 or 4.0 format
- **Duplicate Detection** - Find duplicates by name or phone number
- **Contact Merging** - Manual and automatic merge with master/slave pattern
- **Search & Filter** - Real-time contact search
- **Clean UI** - Modern, responsive dark-themed interface

## vCard 4.0 Support

This application fully supports **vCard 4.0** (RFC 6350) with the following features:

### New vCard 4.0 Fields
- **GENDER** - Gender identity (M/F/O/N/U)
- **ANNIVERSARY** - Anniversary dates (e.g., wedding date)
- **KIND** - Entity type (individual/group/org/location)
- **LANG** - Language preference (e.g., en, es, fr)

### Version Handling
- **Automatic Detection** - Recognizes vCard 2.1, 3.0, and 4.0 on import
- **Smart Export** - Prompts to choose format when exporting legacy contacts
- **Downgrade Support** - Can export to vCard 3.0 for compatibility with older devices
- **Default Format** - New contacts are created in vCard 4.0 format

### Compatibility
- ✅ **Modern Devices**: iOS 14+, Android 10+, modern email clients
- ✅ **Cloud Services**: CardDAV, Nextcloud, Baïkal
- ✅ **Legacy Support**: Can export to vCard 3.0 for older systems

### Sample Files
- `test_vcard40.vcf` - Example vCard 4.0 file with all new fields
- `test_vcard30.vcf` - Example vCard 3.0 file for compatibility testing

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

**351 tests** | **99.87% coverage** | Vitest + V8

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
    vcard: {
        defaultVersion: '4.0',      // Default vCard export version
        supportedVersions: ['2.1', '3.0', '4.0']
    },
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
