import Dexie from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import { Observable } from 'rxjs';

type ThenShortcut<T, TResult> = (value: T) => TResult | PromiseLike<TResult>;

declare module 'dexie' {
    interface Dexie {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<IDatabaseChange[]>;
    }
    namespace Dexie {
        interface Table<T, Key> {
            /**
             * Get a single record as an RxJs observable and observe changes.
             * Uses Table.get().
             * @param key Primary key to find.
             */
            get$(key: Key): Observable<T | undefined>;
            /**
             * Get a full table as an RxJs observable and observe changes.
             * Uses Table.toArray().
             */
            $: Observable<T[]>;
        }
        interface Collection<T, Key> {
            /**
             * Get a collection (Table.where()) as an RxJs observable and observe changes.
             * Uses Collection.toArray().
             */
            $: Observable<T[]>;
        }
    }
}

export default Dexie