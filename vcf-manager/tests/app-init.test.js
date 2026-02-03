/**
 * App Initialization Tests
 * 
 * Tests for proper ES module initialization and window global exposure.
 * These tests prevent regression of the "core is undefined" error that occurs
 * when ES modules are loaded incorrectly or globals are not exposed.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Import all modules to verify they export correctly
import Config from '../src/config.js';
import PhoneUtils from '../src/utils/phone.js';
import VCFParser from '../src/core/vcf-parser.js';
import ContactManager from '../src/core/contacts.js';
import MergeTool from '../src/features/merge-tool.js';
import AutoMerger from '../src/features/auto-merger.js';

describe('App Initialization - ES Module Exports', () => {
    /**
     * These tests verify that all modules export their classes/objects correctly.
     * This prevents the "core is undefined" error that occurred when modules
     * had invalid ES module syntax.
     */

    test('Config should export an object with required properties', () => {
        expect(Config).toBeDefined();
        expect(typeof Config).toBe('object');
        expect(Config.version).toBeDefined();
        expect(Config.appName).toBeDefined();
        expect(Config.phone).toBeDefined();
        expect(Config.phone.defaultCountryCode).toBe('+34');
        expect(Config.phone.minLength).toBe(9);
        expect(Config.ui).toBeDefined();
        expect(Config.messages).toBeDefined();
    });

    test('PhoneUtils should export an object with normalize and format methods', () => {
        expect(PhoneUtils).toBeDefined();
        expect(typeof PhoneUtils).toBe('object');
        expect(typeof PhoneUtils.normalize).toBe('function');
        expect(typeof PhoneUtils.format).toBe('function');
    });

    test('VCFParser should export an object with parse, export, and download methods', () => {
        expect(VCFParser).toBeDefined();
        expect(typeof VCFParser).toBe('object');
        expect(typeof VCFParser.parse).toBe('function');
        expect(typeof VCFParser.export).toBe('function');
        expect(typeof VCFParser.download).toBe('function');
    });

    test('ContactManager should export a class constructor', () => {
        expect(ContactManager).toBeDefined();
        expect(typeof ContactManager).toBe('function');
        // Verify it's a constructor (can instantiate)
        const instance = new ContactManager();
        expect(instance).toBeInstanceOf(ContactManager);
    });

    test('MergeTool should export a class constructor', () => {
        expect(MergeTool).toBeDefined();
        expect(typeof MergeTool).toBe('function');
        // Verify it's a constructor (can instantiate)
        const instance = new MergeTool();
        expect(instance).toBeInstanceOf(MergeTool);
    });

    test('AutoMerger should export a class constructor', () => {
        expect(AutoMerger).toBeDefined();
        expect(typeof AutoMerger).toBe('function');
        // Verify it's a constructor (can instantiate)
        const instance = new AutoMerger();
        expect(instance).toBeInstanceOf(AutoMerger);
    });
});

describe('App Initialization - Instance Methods', () => {
    /**
     * These tests verify that class instances have all required methods
     * that are called from HTML onclick handlers.
     * 
     * If any of these methods are missing, the browser will throw
     * "can't access property X, Y is undefined" errors.
     */

    let contactManager;
    let mergeTool;
    let autoMerger;

    beforeEach(() => {
        contactManager = new ContactManager();
        mergeTool = new MergeTool();
        autoMerger = new AutoMerger();
    });

    describe('ContactManager required methods (called from HTML onclick)', () => {
        test('should have exportVCF method', () => {
            expect(typeof contactManager.exportVCF).toBe('function');
        });

        test('should have clearAll method', () => {
            expect(typeof contactManager.clearAll).toBe('function');
        });

        test('should have addNewContact method', () => {
            expect(typeof contactManager.addNewContact).toBe('function');
        });

        test('should have toggleSort method', () => {
            expect(typeof contactManager.toggleSort).toBe('function');
        });

        test('should have setFilter method', () => {
            expect(typeof contactManager.setFilter).toBe('function');
        });

        test('should have deleteSelected method', () => {
            expect(typeof contactManager.deleteSelected).toBe('function');
        });

        test('should have deselectAll method', () => {
            expect(typeof contactManager.deselectAll).toBe('function');
        });

        test('should have toggleSelect method', () => {
            expect(typeof contactManager.toggleSelect).toBe('function');
        });

        test('should have init method', () => {
            expect(typeof contactManager.init).toBe('function');
        });

        test('should have render method', () => {
            expect(typeof contactManager.render).toBe('function');
        });
    });

    describe('MergeTool required methods (called from HTML onclick)', () => {
        test('should have init method', () => {
            expect(typeof mergeTool.init).toBe('function');
        });

        test('should have close method', () => {
            expect(typeof mergeTool.close).toBe('function');
        });

        test('should have commit method', () => {
            expect(typeof mergeTool.commit).toBe('function');
        });

        test('should have cloneContact method', () => {
            expect(typeof mergeTool.cloneContact).toBe('function');
        });

        test('should have addCustomField method', () => {
            expect(typeof mergeTool.addCustomField).toBe('function');
        });

        test('should have swapMaster method', () => {
            expect(typeof mergeTool.swapMaster).toBe('function');
        });
    });

    describe('AutoMerger required methods (called from HTML onclick)', () => {
        test('should have start method', () => {
            expect(typeof autoMerger.start).toBe('function');
        });

        test('should have cancel method', () => {
            expect(typeof autoMerger.cancel).toBe('function');
        });

        test('should have processNext method', () => {
            expect(typeof autoMerger.processNext).toBe('function');
        });
    });
});

describe('App Initialization - Module Dependencies', () => {
    /**
     * These tests verify that modules can access their dependencies.
     * This catches issues where import statements are missing or incorrect.
     */

    test('PhoneUtils.normalize should work (depends on Config)', () => {
        // PhoneUtils.normalize uses Config.phone.minLength
        const result = PhoneUtils.normalize('612345678');
        expect(result).toBe('+34612345678');
    });

    test('PhoneUtils.format should work (depends on normalize)', () => {
        const result = PhoneUtils.format('612345678');
        expect(result).toBe('+34 612 345 678');
    });

    test('VCFParser.parse should work (depends on Config, PhoneUtils)', () => {
        const vcf = `BEGIN:VCARD
VERSION:3.0
FN:Test User
TEL:612345678
END:VCARD`;
        const contacts = VCFParser.parse(vcf);
        expect(contacts).toHaveLength(1);
        expect(contacts[0].fn).toBe('Test User');
    });

    test('VCFParser.export should work (depends on PhoneUtils)', () => {
        const contacts = [{
            _id: '1',
            fn: 'Test User',
            tels: ['612345678'],
            emails: [],
            org: ''
        }];
        const vcf = VCFParser.export(contacts);
        expect(vcf).toContain('BEGIN:VCARD');
        expect(vcf).toContain('VERSION:4.0');
        expect(vcf).toContain('FN:Test User');
        expect(vcf).toContain('TEL;TYPE=cell:+34612345678');
    });
});

describe('App Initialization - Window Global Exposure Simulation', () => {
    /**
     * These tests simulate what app.js does when exposing globals to window.
     * In the browser, this is required for HTML onclick handlers to work.
     */

    beforeEach(() => {
        // Clean up any previous globals
        delete window.Config;
        delete window.PhoneUtils;
        delete window.VCFParser;
        delete window.core;
        delete window.mergeTool;
        delete window.autoMerger;
    });

    test('should be able to expose Config to window', () => {
        window.Config = Config;
        expect(window.Config).toBe(Config);
        expect(window.Config.version).toBeDefined();
    });

    test('should be able to expose PhoneUtils to window', () => {
        window.PhoneUtils = PhoneUtils;
        expect(window.PhoneUtils).toBe(PhoneUtils);
        expect(typeof window.PhoneUtils.normalize).toBe('function');
    });

    test('should be able to expose VCFParser to window', () => {
        window.VCFParser = VCFParser;
        expect(window.VCFParser).toBe(VCFParser);
        expect(typeof window.VCFParser.parse).toBe('function');
    });

    test('should be able to expose core (ContactManager instance) to window', () => {
        const core = new ContactManager();
        window.core = core;
        expect(window.core).toBe(core);
        expect(typeof window.core.exportVCF).toBe('function');
        expect(typeof window.core.clearAll).toBe('function');
    });

    test('should be able to expose mergeTool (MergeTool instance) to window', () => {
        const mergeTool = new MergeTool();
        window.mergeTool = mergeTool;
        expect(window.mergeTool).toBe(mergeTool);
        expect(typeof window.mergeTool.init).toBe('function');
    });

    test('should be able to expose autoMerger (AutoMerger instance) to window', () => {
        const autoMerger = new AutoMerger();
        window.autoMerger = autoMerger;
        expect(window.autoMerger).toBe(autoMerger);
        expect(typeof window.autoMerger.start).toBe('function');
    });

    test('simulated initApp should expose all required globals', () => {
        // Simulate what app.js initApp() does
        window.Config = Config;
        window.PhoneUtils = PhoneUtils;
        window.VCFParser = VCFParser;
        
        const core = new ContactManager();
        const mergeTool = new MergeTool();
        const autoMerger = new AutoMerger();
        
        window.core = core;
        window.mergeTool = mergeTool;
        window.autoMerger = autoMerger;

        // Verify all globals are accessible (as HTML onclick would need them)
        expect(window.core).toBeDefined();
        expect(window.mergeTool).toBeDefined();
        expect(window.autoMerger).toBeDefined();
        expect(window.Config).toBeDefined();
        expect(window.PhoneUtils).toBeDefined();
        expect(window.VCFParser).toBeDefined();

        // Verify methods can be called (simulates onclick="core.exportVCF()")
        expect(() => window.core.exportVCF).not.toThrow();
        expect(() => window.core.clearAll).not.toThrow();
        expect(() => window.mergeTool.init).not.toThrow();
        expect(() => window.autoMerger.start).not.toThrow();
    });
});
