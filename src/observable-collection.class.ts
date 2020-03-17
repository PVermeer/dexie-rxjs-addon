import { Collection, Dexie, Table } from 'dexie';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, shareReplay, startWith } from 'rxjs/operators';

interface CollectionExtended<T, TKey> extends Collection<T, TKey> {
    db: Dexie;
    _ctx: { [prop: string]: any };
}

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
        private _db: Dexie,
        private _table: Table<T, TKey>,
        private _collection: Collection<T, TKey>
    ) {
        /*
            Class can be created from some methods on the WhereClause class so
            mixin all private methods and properties to keep internal calls accessible.
        */
        const collection = _collection as CollectionExtended<T, TKey>;
        this.db = collection.db;
        this._ctx = collection._ctx;
        Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(_collection))).forEach(name => {
            if (name === 'constructor') { return; }
            if (name.startsWith('_')) { this[name] = _collection[name]; }
        });

    }
}
