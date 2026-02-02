# VCF Manager - AI-Maintained Project

> 🤖 **AI-Maintained Codebase**: This project is designed and structured specifically for AI agents to understand, maintain, and extend.

## 📖 Documentation for AI Agents

This repository contains comprehensive documentation to help AI agents work effectively:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture, data flows, and module descriptions
- **[CONTRIBUTING_FOR_AI.md](CONTRIBUTING_FOR_AI.md)** - Development guidelines, patterns, and workflows for AI agents
- **[CODE_STRUCTURE.md](CODE_STRUCTURE.md)** - File organization, dependencies, and quick reference guide

## 🎯 Project Overview

**VCF Manager** is a single-page application for managing VCF (vCard) contact files with features for:
- Importing and parsing VCF files
- Automatic duplicate detection (by name or phone)
- Manual contact merging and editing
- Exporting clean contact lists

## 🚀 Quick Start

```bash
# Navigate to project
cd vcf-manager

# Install dependencies
npm install

# Run tests
npm test

# Open in browser
# Simply open index.html in a web browser (via HTTP server)
```

## 🏗️ Architecture Highlights

- **Pure Vanilla JavaScript** - No frameworks, easy to understand
- **Modular Design** - Clear separation: core, features, utils
- **Well-Tested** - 152+ tests with Jest
- **AI-Friendly** - Explicit types, clear naming, comprehensive docs

## 📁 Repository Structure

```
234578/
├── ARCHITECTURE.md              # Complete system documentation
├── CONTRIBUTING_FOR_AI.md       # AI agent development guide
├── CODE_STRUCTURE.md            # File organization reference
├── README.md                    # This file
└── vcf-manager/                 # Main application
    ├── index.html               # Entry point
    ├── css/styles.css           # Styles
    ├── src/                     # Source code
    │   ├── config.js           # Configuration
    │   ├── core/               # Core modules
    │   ├── features/           # Features
    │   └── utils/              # Utilities
    └── tests/                   # Test suites
```

## 🧪 Testing

All features are thoroughly tested:

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

Current status: **152 tests passing** ✅

## 🤖 For AI Agents

### Before Making Changes
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
2. Check [CODE_STRUCTURE.md](CODE_STRUCTURE.md) to find relevant files
3. Follow [CONTRIBUTING_FOR_AI.md](CONTRIBUTING_FOR_AI.md) guidelines
4. Run tests to understand current state

### Key Principles
- **Minimal Changes** - Only modify what's necessary
- **Test-Driven** - Run tests before and after changes
- **Clear Documentation** - Update docs when changing structure
- **Consistent Patterns** - Follow existing code style

### Common Tasks
- **Adding VCF fields** - See CONTRIBUTING_FOR_AI.md → "Adding a New Contact Field"
- **Adding duplicate detection** - See CONTRIBUTING_FOR_AI.md → "Adding a New Duplicate Detection Method"
- **Modifying UI** - See CODE_STRUCTURE.md → "Where to Make Changes"

## 📊 Code Quality

- ✅ Comprehensive JSDoc comments
- ✅ Clear naming conventions
- ✅ Modular architecture
- ✅ High test coverage
- ✅ Well-documented data flows
- ✅ AI-friendly structure

## 📝 Version

**Current Version**: 11.1

## 📄 License

MIT License

---

**Maintained exclusively by AI Agents** | Last Updated: 2026-02-02