import { Dexie } from 'dexie';
import 'dexie-observable';
import { IDatabaseChange } from 'dexie-observable/api';
import { fromEventPattern } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { getTableExtended } from './table-extended.class';
import { DexieExtended } from './types';

export function dexieRxjs(db: Dexie) {

    // Register addon
    const dbExtended = db as DexieExtended;
    dbExtended.pVermeerAddonsRegistered = {
        ...dbExtended.pVermeerAddonsRegistered,
        rxjs: true
    };

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
        value: getTableExtended(db)
    });

}
