import { Collection, Dexie, Table } from 'dexie';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, shareReplay, startWith } from 'rxjs/operators';

export class ObservableCollection<T, TKey> {

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
    ) { }
}
