import Dexie, { Table, WhereClause } from 'dexie';
import { ObservableCollection } from './observableCollection.class';
import { DexieExtended } from './types';

type WhereClauseObservable<T, TKey> = {
    [P in keyof WhereClause]: WhereClause[P] extends (...args: infer A) => any ?
    (...args: A) => ObservableCollection<T, TKey> : WhereClause[P]
};
export interface ObservableWhereClause<T, TKey> extends WhereClauseObservable<T, TKey> { }

export class ObservableWhereClause<T, TKey> {

    get Collection() {
        const dbExt = this._db as DexieExtended;
        const table = this._table;
        // Hijack Collection class getter.
        return class Callable {
            constructor(...args: ConstructorParameters<typeof dbExt.Collection>) {
                const collection = new dbExt.Collection<T, TKey>(...args);
                return new ObservableCollection<T, TKey>(dbExt, table, collection);
            }
        };

    }

    constructor(
        private _db: Dexie,
        private _table: Table<T, TKey>,
        _whereClause: WhereClause<T, TKey>
    ) {

        // Extend with normal whereClause
        Object.keys(_whereClause).forEach(key => {
            if (key === 'constructor' || this[key] !== undefined) { return; }
            this[key] = _whereClause[key];
        });
        const prototype = Object.getPrototypeOf(Object.getPrototypeOf(_whereClause));
        Object.getOwnPropertyNames(prototype).forEach(name => {
            if (name === 'constructor' || this[name] !== undefined) { return; }
            this[name] = prototype[name];
        });

    }

}
