import Dexie, { Collection, KeyRange, Table, TableSchema, Transaction, WhereClause } from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import { Observable } from 'rxjs';
import { TableExtended } from '../tableExt.class';

export interface DexieExtended extends Dexie {
    pVermeerAddonsRegistered?: { [addon: string]: boolean };
    Table: new <T, TKey>(name: string, tableSchema: TableSchema, optionalTrans?: Transaction) => Table<T, TKey>;
    Collection: new <T, TKey>(whereClause?: WhereClause | null, keyRangeGenerator?: () => KeyRange) => Collection<T, TKey>;
}

declare module 'dexie' {
    interface Dexie {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<IDatabaseChange[]>;
    }
    interface Table<T, TKey> extends TableExtended<T, TKey> { }
}

declare module 'dexie-observable/api' {
    interface IUpdateChange {
        oldObj: any;
        obj: any;
    }

    interface IDeleteChange {
        oldObj: any;
    }
}
