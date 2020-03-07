// tslint:disable: space-before-function-paren
// tslint:disable: object-literal-shorthand
import { Dexie, IndexableType, IndexSpec } from 'dexie';
import { ICreateChange, IDatabaseChange, IUpdateChange } from 'dexie-observable/api';
import { isEqual } from 'lodash';
import { from, fromEventPattern, Observable } from 'rxjs';
import { distinctUntilChanged, filter, flatMap, map, share, shareReplay, startWith, switchMap } from 'rxjs/operators';

type ChangeCb = [IDatabaseChange[], boolean];
type TableExtended = Dexie.Table<any, any> & {
    _table$: Observable<any[]>;
};
type CollectionExtended = Dexie.Collection<any, any> & {
    _ctx: {
        table: Dexie.Table<any, any>;
    };
    _collection$: Observable<any>;
};

/** @internal */
export function addChanges$(db: Dexie) {

    Object.defineProperty(db, 'changes$', {
        value: fromEventPattern<ChangeCb>(handler => db.on('changes', handler)).pipe(
            map(x => x[0]),
            share()
        )
    });

}

/** @internal */
export function addGet$(db: Dexie) {

    Object.defineProperty(db.Table.prototype, 'get$', {
        value: function (
            this: TableExtended,
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

/** @internal */
export function addTable$(db: Dexie) {

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

/** @internal */
export function addWhere$(db: Dexie) {

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
/** @internal */
function setPrimaryKey<T>(
    primKey: IndexSpec,
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
