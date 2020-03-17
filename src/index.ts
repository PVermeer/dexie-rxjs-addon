import { Observable } from 'rxjs';
import { TableExtended } from './tableExt.class';

export { dexieRxjs } from './dexie-rxjs';
export { ObservableCollection } from './observableCollection.class';
export { ObservableTable } from './observableTable.class';
export { ObservableWhereClause } from './observableWhereClause.class';
export { TableExtended } from './tableExt.class';

declare module 'dexie' {
    interface Database {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<(import('dexie-observable/api').IDatabaseChange[])>;
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
