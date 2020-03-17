import { Collection, Dexie, Table } from 'dexie';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, shareReplay, startWith } from 'rxjs/operators';

export class ObservableCollection<T, TKey> {

    db: Dexie;
    _ctx: { [prop: string]: any };

    private _collection$: Observable<T[]> = this._db.changes$.pipe(
        filter(x => x.some(y => y.table === this._table.name)),
        startWith([]),
        flatMap(async () => this._collection.toArray()),
        distinctUntilChanged(isEqual),
        shareReplay()
    );

    public toArray() { return this._collection$; }

    constructor(
        protected _db: Dexie,
        protected _table: Table<T, TKey>,
        protected _collection: Collection<T, TKey>
    ) {

        // Mixin with WhereClause
        Object.keys(_collection).forEach(key => {
            if (key === 'constructor' || this[key] !== undefined) { return; }
            this[key] = _collection[key];
        });

        const prototype = Object.getPrototypeOf(_db.Collection.prototype);
        Object.getOwnPropertyNames(prototype).forEach(name => {
            if (this[name] !== undefined) { return; }
            Object.defineProperty(
                ObservableCollection.prototype,
                name,
                Object.getOwnPropertyDescriptor(prototype, name) as any
            );
        });

    }

}
