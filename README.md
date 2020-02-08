Dexie RxJs Addon
======

[![NPM Version](https://img.shields.io/npm/v/@pvermeer/dexie-rxjs-addon/latest.svg)](https://www.npmjs.com/package/@pvermeer/dexie-rxjs-addon)
[![Build Status](https://travis-ci.org/PVermeer/dexie-rxjs-addon.svg?branch=master)](https://travis-ci.org/PVermeer/dexie-rxjs-addon)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Install over npm
----------------
```
npm install @pvermeer/dexie-rxjs-addon rxjs
```

#### Dependencies
**rxjs**: https://rxjs-dev.firebaseapp.com/

#### Extend RxJs to your Dexie Database!

Plugin is written to extend Dexie.js with your own RxJs by adding some methods / properties to the Dexie classes.
RxJs is not bundled so you can use your own implementation.

#### Example (ES6)
```js
import Dexie from 'dexie';
import { dexieRxjs } from '@pvermeer/dexie-rxjs-addon';

// Declare Database
const db = new Dexie("FriendDatabase", {
    addons: [dexieRxjs]
});
db.version(1).stores({ friends: "++id, name, shoeSize, age" });

// Open the database
db.open()
    .then(() => {
        console.log('DB loaded! :D')
        // Use Dexie
    });
```

#### Example (Typescript)
```ts
import Dexie from 'dexie';
import { dexieRxjs } from '@pvermeer/dexie-rxjs-addon';

interface Friend {
    id?: number;
    name?: string;
    shoeSize?: number;
    age?: number;
}

// Declare Database
class FriendsDatabase extends Dexie {
    public friends: Dexie.Table<Friend, string>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++id, name, shoeSize, age'
        });
    }
}

const db = new FriendDatabase('FriendsDatabase');

// Open the database
db.open()
    .then(() => {
        console.log('DB loaded! :D')
        // Use Dexie
    });
```

#### Example (HTML import)

Bundled & minified package: <https://unpkg.com/@pvermeer/dexie-rxjs-addon@latest/dist/dexie-rxjs-addon.min.js>.

Addon is export as namespace DexieRxjsAddon

```html
<!doctype html>
<html>
    <head>
        <!-- Include Dexie -->
        <script src="https://unpkg.com/dexie@latest/dist/dexie.js"></script>

        <!-- Include RxJs -->
        <script src="https://unpkg.com/rxjs/bundles/rxjs.umd.min.js"></script>

        <!-- Include DexieRxjsAddon (always after dependencies) -->
        <script src="https://unpkg.com/@pvermeer/dexie-rxjs-addon@latest/dist/dexie-rxjs-addon.min.js"></script>

        <script>

            // Define your database
            const db = new Dexie("FriendDatabase", {
                addons: [DexieRxjsAddon.dexieRxjs]
            });
            db.version(1).stores({ friends: "++id, name, shoeSize, age" });

            // Open the database
            db.open()
                .then(() => {
                    console.log('DB loaded! :D')
                    // Do Dexie stuff
                });
        </script>
    </head>
</html>

```

API
---
The packet exposes new methods and properties on Dexie classes:

(*Will be expanded on*)

```ts
    interface Dexie {
        /**
         * Get on('changes') from 'dexie-observable' as an RxJs observable and observe changes.
         * @link https://dexie.org/docs/Observable/Dexie.Observable
         */
        changes$: Observable<IDatabaseChange[]>;
    }

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
```

---------------------------------------------------

Dexie.js
========

Dexie.js is a wrapper library for indexedDB - the standard database in the browser. http://dexie.org
