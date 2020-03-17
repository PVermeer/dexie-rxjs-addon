// tslint:disable: unified-signatures
import { Collection, Dexie, IndexableType, Table, WhereClause } from 'dexie';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, share, shareReplay, startWith } from 'rxjs/operators';
import { ObservableCollection } from './observable-collection.class';
import { ObservableWhereClause } from './observable-where-clause.class';
import { DexieExtended } from './types';

export class ObservableTable<T, TKey> {

    private _table$: Observable<T[]> = this._db.changes$.pipe(
        filter(x => x.some(y => y.table === this._table.name)),
        startWith([]),
        flatMap(() => this._table.toArray()),
        distinctUntilChanged(isEqual),
        shareReplay()
    );

    // ====== toArray() ======

    public toArray() { return this._table$; }


    // ====== get() ======

    get(key: TKey): Observable<T | undefined>;
    get(equalityCriterias: { [key: string]: any }): Observable<T | undefined>;
    get(keyOrequalityCriterias: TKey | { [key: string]: any }): Observable<T | undefined>;

    public get(keyOrequalityCriterias: TKey | { [key: string]: any }) {

        return this._db.changes$.pipe(
            filter(x => x.some(y => y.table === this._table.name)),
            filter(x => {
                if (typeof keyOrequalityCriterias === 'object' && typeof keyOrequalityCriterias !== null) {

                    return Object.entries(keyOrequalityCriterias).some(([key, value]) =>
                        x.some(y => {
                            const obj = 'obj' in y ? y.obj : y.oldObj;
                            return obj[key] && obj[key] === value ? true :
                                y.key === value ? true : false;
                        })
                    );

                } else {
                    const primKey = keyOrequalityCriterias;
                    return x.some(y => primKey === y.key);
                }
            }),
            startWith(null),
            flatMap(() => this._table.get(keyOrequalityCriterias)),
            distinctUntilChanged(isEqual),
            share()
        );
    }

    // ====== where() ======

    where(index: string | string[]): ObservableWhereClause<T, TKey>;
    where(equalityCriterias: { [key: string]: IndexableType }): ObservableCollection<T, TKey>;

    public where(
        indexOrequalityCriterias: string | string[] | { [key: string]: any }
    ): ObservableWhereClause<T, TKey> | ObservableCollection<T, TKey> {

        const CollectionExt = this._db.Collection as DexieExtended['Collection'];

        const whereClauseOrCollection = this._table
            // No combined overload in Dexie.js, so strong typed
            .where(indexOrequalityCriterias as any) as WhereClause<T, TKey> | Collection<T, TKey>;

        // Check what's returned.
        if (whereClauseOrCollection instanceof CollectionExt) {

            const collection = whereClauseOrCollection;
            return new ObservableCollection(this._db, this._table, collection);

        } else {

            const whereClause = whereClauseOrCollection;
            return new ObservableWhereClause<T, TKey>(this._db, this._table, whereClause);

        }

    }

    constructor(
        protected _db: Dexie,
        protected _table: Table<T, TKey>
    ) { }

}
