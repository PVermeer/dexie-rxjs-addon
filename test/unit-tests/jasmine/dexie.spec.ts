import { Dexie as DexieImport } from 'dexie';

// declare interface DexieRxjsAddonType { dexieRxjs: typeof dexieRxjs; }

/*
 * Lib is not really meant for node but package should be able to be required in node.
 */
describe('Dexie', () => {
    describe('Node require', () => {
        let DexieReq: typeof DexieImport;
        beforeAll(() => {
            DexieReq = require('dexie');
            require('rxjs');
        });
        it('should load Dexie.js', () => {
            expect(DexieReq).toBeTruthy();
        });
        it('should throw when trying to require', () => {
            let addon: any;
            // Addon throws because window.self is not defined.
            // Dependency 'dexie-observable' relies on this.
            try {
                addon = require('../../../dist/index');
            } catch (error) {
                expect(error instanceof Error).toBeTrue();
            }
            expect(addon).toBeUndefined();
        });
    });
});