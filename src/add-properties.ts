// tslint:disable: space-before-function-paren
// tslint:disable: object-literal-shorthand
import { IndexableType } from 'dexie';
import { isEqual } from 'lodash';
import { from, fromEventPattern, Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, map, share, shareReplay, startWith, switchMap } from 'rxjs/operators';
import DexieType from './types/augment-dexie';
import { ICreateChange, IDatabaseChange, IUpdateChange } from './types/augment-dexie-observable-api';

type ChangeCb = [IDatabaseChange[], boolean];
type TableExtended = DexieType.Table<any, any> & {
    _table$: Observable<any[]>;
};
type CollectionExtended = DexieType.Collection<any, any> & {
    _ctx: {
        table: DexieType.Table<any, any>;
    };
    _collection$: Observable<any>;
};

export function addChanges$(db: DexieType) {

    Object.defineProperty(db, 'changes$', {
        value: fromEventPattern<ChangeCb>(handler => db.on('changes', handler)).pipe(
            map(x => x[0]),
            share()
        )
    });

}

export function addGet$(db: DexieType) {

    Object.defineProperty(db.Table.prototype, 'get$', {
        value: function (
            this: DexieType.Table<any, any>,
            key: IndexableType
        ) {
            return from(this.get(key)).pipe(
                switchMap(original => db.changes$.pipe(
                    filter(x => x.some(y => this.name === y.table && key === y.key)),
                    startWith([]),
                    map((changes, i) => {

                        if (i === 0) { return original; }

                        let record: object | undefined;
                        changes.forEach(change => {
                            const table = change.table;
                            const primKey = change.key;

                            if (this.name === table && key === primKey) {

                                switch (change.type) {
                                    case 1: {
                                        record = (change as ICreateChange).obj;
                                        break;
                                    }
                                    case 2: {
                                        record = (change as IUpdateChange).obj;
                                        break;
                                    }
                                    case 3:
                                    default: {
                                        record = undefined;
                                    }
                                }
                                if (record) {
                                    record = setPrimaryKey(this.schema.primKey, record, primKey);
                                }
                            }
                        });
                        return record;
                    }),
                )),
                distinctUntilChanged(isEqual),
                share()
            );
        }
    });
}

export function addTable$(db: DexieType) {

    Object.defineProperty(db.Table.prototype, '$', {
        get: function (this: TableExtended) {
            if (!this._table$) {

                /**
                 * Represents the current state of the table.
                 * On first subscription (get $) emit fresh data then sub to changes.
                 */
                this._table$ = db.changes$.pipe(
                    filter(x => x.some(y => y.table === this.name)),
                    startWith([]),
                    flatMap(async () => this.toArray()),
                    distinctUntilChanged(isEqual),
                    shareReplay(),
                );

            }
            return this._table$;
        }
    });

}

export function addWhere$(db: DexieType) {

    Object.defineProperty(db.Collection.prototype, '$', {
        get: function (this: CollectionExtended) {
            if (!this._collection$) {

                /**
                 * Represents the current state of the collection.
                 * On first subscription (get $) emit fresh data then sub to changes.
                 */
                this._collection$ = db.changes$.pipe(
                    filter(x => x.some(y => y.table === this._ctx.table.name)),
                    startWith([]),
                    flatMap(async () => this.toArray()),
                    distinctUntilChanged(isEqual),
                    shareReplay()
                );

            }
            return this._collection$;
        }

    });
}


// ========= Helper functions ==========
function setPrimaryKey<T>(
    primKey: DexieType.IndexSpec,
    object: T & object,
    value: IndexableType
): T {

    if (!primKey.auto || primKey.keyPath === null) { return object; }

    const splitted = (primKey.keyPath as string).split('.');
    splitted.reduce((obj, current, i) => {
        if (i === splitted.length - 1) {
            return obj[current] = value;
        }
        if (!obj[current]) { obj[current] = {}; }
        return obj[current];
    }, object);

    return object;
}
