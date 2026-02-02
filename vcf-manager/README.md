# VCF Manager 11.1

SPA for managing VCF contact files (Parse, Merge, Export).
Maintained by AI Agents.

## 📁 System Architecture

```
vcf-manager/
├── index.html
├── src/
│   ├── app.js              # Entry point
│   ├── config.js
│   ├── core/
│   │   ├── contacts.js     # State store & basic operations
│   │   └── vcf-parser.js   # VCard parsing logic
│   └── features/
│       ├── auto-merger.js  # Duplicate detection logic
│       └── merge-tool.js   # Merge UI & resolution strategy
├── css/styles.css
└── tests/                  # Jest suites
```

## 🛠️ Stack

- **Core**: Vanilla JS (ES Modules)
- **UI**: HTML5 + CSS Variables (No frameworks)
- **Test**: Jest + JSDOM

## ⚡ Key Commands

```bash
npm test              # Run all unit/integration tests
npm run test:coverage # Generate coverage report
```

MIT License
