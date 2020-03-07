import { Dexie } from 'dexie';
import 'dexie-observable';
import { IDatabaseChange } from 'dexie-observable/api';
import { fromEventPattern } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { getTableExtended } from './tableExt.class';
import { DexieExtended } from './types/types';

export function dexieRxjs(db: Dexie) {

    // Register addon
    const dbExtended = db as DexieExtended;
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

    // Extend the DB class
    type ChangeCb = [IDatabaseChange[], boolean];
    Object.defineProperty(db, 'changes$', {
        value: fromEventPattern<ChangeCb>(handler => db.on('changes', handler)).pipe(
            map(x => x[0]),
            share()
        )
    });

    // Extend the Table class.
    Object.defineProperty(db, 'Table', {
        value: getTableExtended(dbExtended)
    });

    db.on('populate', checkSchema);
    db.on('versionchange', checkSchema);
    db.on('ready', checkSchema);

}
