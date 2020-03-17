import Dexie, { Table, WhereClause } from 'dexie';
import { ObservableCollection } from './observable-collection.class';
import { DexieExtended } from './types';

type WhereClauseRecord<T, TKey, U = Omit<WhereClause, keyof InstanceType<typeof ObservableWhereClause>>> = {
    [P in keyof U]: U[P] extends (...args: infer A) => any ?
    (...args: A) => ObservableCollection<T, TKey> : U[P]
};
export interface ObservableWhereClause<T, TKey> extends WhereClauseRecord<T, TKey> { }

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
        } as unknown as typeof ObservableCollection;
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
