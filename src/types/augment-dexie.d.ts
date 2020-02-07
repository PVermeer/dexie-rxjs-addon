import Dexie from 'dexie';
import { IDatabaseChange } from 'dexie-observable/api';
import { Observable } from 'rxjs';

type ThenShortcut<T, TResult> = (value: T) => TResult | PromiseLike<TResult>;

declare module 'dexie' {
    interface Dexie {
        changes$: Observable<IDatabaseChange[]>;
    }
    namespace Dexie {
        interface Table<T, Key> {
            get$(key: Key): Observable<T | undefined>;
            $: Observable<T[]>;
        }
        interface Collection<T, Key> {
            $: Observable<T[]>;
        }
    }
}

export default Dexie