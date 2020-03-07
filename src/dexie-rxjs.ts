import { Dexie } from 'dexie';
import 'dexie-observable';
import { addChanges$, addGet$, addTable$, addWhere$ } from './add-properties';
import { DexieExtended } from './types/types';

export function dexieRxjs(db: Dexie) {

    // Register addon
    const dbExtended: DexieExtended = db;
    dbExtended.pVermeerAddonsRegistered = {
        ...dbExtended.pVermeerAddonsRegistered,
        rxjs: true
    };

    function checkSchema() {
        const unSupported = db.tables.some(table =>
            [table.schema.primKey, ...table.schema.indexes].some(index => index.compound || index.multi));

        if (unSupported) {
            throw new Error('Compound or multi indices are not (yet) supported in combination with Dexie RxJs Addon');
        }
    }
    db.on('populate', checkSchema);
    db.on('versionchange', checkSchema);
    db.on('ready', checkSchema);

    addChanges$(db);
    addGet$(db);
    addWhere$(db);
    addTable$(db);

}
