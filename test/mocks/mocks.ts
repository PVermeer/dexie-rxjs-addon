import { default as DexieType } from 'dexie';
import faker from 'faker/locale/nl';
import { EMPTY, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { dexieRxjs } from '../../src';

export interface Friend {
    id?: number;
    testProp?: string;
    hasAge?: boolean;
    firstName: string;
    lastName: string;
    shoeSize: number;
    customId: number;
    some?: { id: number; };
}

type TestDatabaseType = DexieType & { friends: DexieType.Table<Friend, number> };

export const databasesPositive = [
    {
        desc: 'TestDatabase',
        db: (Dexie: typeof DexieType) => new class TestDatabase extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: '++id, customId, firstName, lastName, shoeSize, age'
                });
            }
        }('TestDatabase')
    },
    {
        desc: 'TestDatabaseKeyPath',
        db: (Dexie: typeof DexieType) => new class TestDatabaseKeyPath extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: '++some.id, customId, firstName, lastName, shoeSize, age'
                });
            }
        }('TestDatabaseKeyPath')
    },
    {
        desc: 'TestDatabaseCustomKey',
        db: (Dexie: typeof DexieType) => new class TestDatabaseCustomKey extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: 'customId, firstName, lastName, shoeSize, age'
                });
            }
        }('TestDatabaseCustomKey')
    },
    {
        desc: 'TestDatabaseNoKey',
        db: (Dexie: typeof DexieType) => new class TestDatabaseNoKey extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: '++, customId, firstName, lastName, shoeSize, age'
                });
            }
        }('TestDatabaseNoKey')
    }
];

export const databasesNegative = [
    {
        desc: 'TestDatabaseCompoundIndex',
        db: (Dexie: typeof DexieType) => new class TestDatabaseCompoundIndex extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: '++id, firstName, lastName, [firstName+lastName], shoeSize, age'
                });
            }
        }('TestDatabaseCompoundIndex')
    },
    {
        desc: 'TestDatabaseMultiIndex',
        db: (Dexie: typeof DexieType) => new class TestDatabaseMultiIndex extends Dexie {
            public friends: DexieType.Table<Friend, number>;
            constructor(name: string) {
                super(name);
                dexieRxjs(this);
                this.version(1).stores({
                    friends: '++id, multi*, firstName, lastName, shoeSize, age'
                });
            }
        }('TestDatabaseMultiIndex')
    }
];

export const methods: {
    desc: string,
    method: (db: TestDatabaseType) => (id: number, emitUndefined?: boolean) => Observable<Friend>
}[] = [
        {
            desc: 'Table.get$()',
            method: (db: TestDatabaseType) => (id: number) => db.friends.get$(id)
        },
        {
            desc: 'Collection.$',
            method: (db: TestDatabaseType) =>
                (id: number, _emitUndefined = false) =>
                    db.friends.where(':id').equals(id).$.pipe(map(x => x[0]))
        },
        {
            desc: 'Table.$',
            method: (db: TestDatabaseType) => (id: number, emitUndefined = false) => db.friends.$.pipe(
                flatMap(x => {
                    /**
                     * The general method tests rely on returning undefined when not found.
                     */
                    const find = x.find(y => y.id === id || y.customId === id || (y.some && y.some.id === id));
                    if (!find && !emitUndefined) { return EMPTY; }
                    return of(find);
                })
            )
        }
    ];

export const mockFriends = (count: number = 5): Friend[] => {
    const friend = () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        age: faker.random.number({ min: 1, max: 80 }),
        shoeSize: faker.random.number({ min: 5, max: 12 }),
        customId: faker.random.number({ min: 1000000, max: 9999999 }),
    });
    return new Array(count).fill(null).map(() => friend());
};
