// tslint:disable: space-before-function-paren
// tslint:disable: object-literal-shorthand
import { IndexableType } from 'dexie';
import { from, fromEventPattern } from 'rxjs';
import { distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import Dexie from './types/augment-dexie';
import { IDatabaseChange, ICreateChange } from './types/augment-dexie-observable-api';

type ChangeCb = [IDatabaseChange[], boolean];

export function addProperties(db: Dexie) {

    Object.defineProperty(db, 'changes$', {
        value: fromEventPattern<ChangeCb>(handler => db.on('changes', handler)).pipe(
            map(x => x[0]),
            share()
        )
    });

    Object.defineProperty(db.Table.prototype, 'get$', {
        value: function (
            this: Dexie.Table<any, any>,
            key: IndexableType
        ) {
            return from(this.get(key)).pipe(
                switchMap(original => db.changes$.pipe(
                    startWith([]),
                    map(changes => {

                        let record = original;
                        changes.forEach(change => {
                            const table = change.table;
                            const primKey = change.key;

                            if (change.type === 1) {
                                record = (change as ICreateChange).obj;

                            } else if (change.type === 2 && 'mods' in change) {
                                if (this.name === table && key === primKey) {
                                    record = change.obj;
                                }

                            } else if (change.type === 3) {
                                record = undefined;
                            }

                            if (record) {
                                record = setPrimaryKey(this.schema.primKey, record, primKey);
                            }
                        });
                        return record;
                    }),
                    distinctUntilChanged()
                )),
                share()
            );
        }
    });
}

// ========= Helper functions ==========
function setPrimaryKey<T = { [prop: string]: any }>(
    primKey: Dexie.IndexSpec,
    object: T,
    value: IndexableType
): T {

    if (primKey.compound || primKey.multi) {
        throw new Error('Compound or multi primary key is not (yet) supported');
    }
    if (!primKey.auto) { return object; }

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
