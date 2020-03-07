import Dexie from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import { Observable } from 'rxjs';

export type DexieExtended = Dexie & {
    pVermeerAddonsRegistered?: { [addon: string]: boolean }
};

declare module 'dexie' {
    interface Dexie {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<IDatabaseChange[]>;
    }
    interface Table<T, TKey> {
        /**
         * Get a full table as an RxJs observable and observe changes.
         *
         * Uses Table.toArray().
         */
        $: Observable<T[]>;
        /**
         * Get a single record as an RxJs observable and observe changes.
         *
         * Uses Table.get().
         * @param key Primary key to find.
         */
        get$(key: Key): Observable<T | undefined>;
    }
    interface Collection<T, TKey> {
        /**
         * Get a collection (Table.where()) as an RxJs observable and observe changes.
         *
         * Uses Collection.toArray().
         */
        $: Observable<T[]>;
    }
}

declare module 'dexie-observable/api' {
    interface IUpdateChange {
        oldObj: any;
        obj: any;
    }
}
