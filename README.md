# VCF Manager

![CI](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/CI/badge.svg)
![Deploy](https://github.com/AntonioSegoviaExposito/copilotTesting/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

A contact management SPA for VCF (vCard) files with duplicate detection and merging. Pure vanilla ES6+ -- no frameworks, no build process, zero runtime dependencies.

**Live Demo**: https://antoniosegoviaexposito.github.io/copilotTesting/

## Features

- Import/export VCF files (single or multiple, with drag & drop)
- Duplicate detection by name or phone number
- Contact merging (manual and automatic with master/slave pattern)
- Real-time search and filtering
- Toast notifications and confirmation dialogs
- Add, edit, clone, and delete contacts

## Quick Start

```bash
cd vcf-manager
npm install    # Dev dependencies only (Vitest)
npm test       # 320 tests, ~99.87% coverage
```

Open `vcf-manager/index.html` in a browser. No build step required.

## Architecture

Vanilla ES6 modules running entirely in the browser. Node/npm used only for testing.

See [CONTRIBUTING_FOR_AI.md](CONTRIBUTING_FOR_AI.md) for file organization, coding standards, and architecture details.

## License

MIT
