// tslint:disable: unified-signatures
import { Dexie } from 'dexie';
import 'dexie-observable';
import { IDatabaseChange } from 'dexie-observable/api';
import { Observable } from 'rxjs';
import { addChanges$, addGet$, addTable$, addWhere$ } from './add-properties';

declare module 'dexie' {
    interface Dexie {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<IDatabaseChange[]>;
    }
    namespace Dexie {
        interface Table<T, Key> {
            /**
             * Get a full table as an RxJs observable and observe changes.
             * Uses Table.toArray().
             */
            $: Observable<T[]>;
            /**
             * Get a single record as an RxJs observable and observe changes.
             * Uses Table.get().
             * @param key Primary key to find.
             */
            get$(key: Key): Observable<T | undefined>;
        }
        interface Collection<T, Key> {
            /**
             * Get a collection (Table.where()) as an RxJs observable and observe changes.
             * Uses Collection.toArray().
             */
            $: Observable<T[]>;
        }
    }
}

declare module 'dexie-observable/api' {
    interface IUpdateChange {
        oldObj: any;
        obj: any;
    }
}

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
