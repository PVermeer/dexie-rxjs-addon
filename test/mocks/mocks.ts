import Dexie from 'dexie';
import { dexieRxjs } from '../../src';
import faker from 'faker/locale/nl';

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

class TestDatabase extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++id, customId, firstName, lastName, shoeSize, age'
        });
    }
}
class TestDatabaseKeyPath extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++some.id, customId, firstName, lastName, shoeSize, age'
        });
    }
}
class TestDatabaseCustomKey extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: 'customId, firstName, lastName, shoeSize, age'
        });
    }
}
class TestDatabaseNoKey extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++, customId, firstName, lastName, shoeSize, age'
        });
    }
}

export const databasesPositive = [
    {
        desc: 'TestDatabase',
        db: () => new TestDatabase('TestDatabase')
    },
    {
        desc: 'TestDatabaseKeyPath',
        db: () => new TestDatabaseKeyPath('TestDatabaseKeyPath')
    },
    {
        desc: 'TestDatabaseCustomKey',
        db: () => new TestDatabaseCustomKey('TestDatabaseCustomKey')
    },
    {
        desc: 'TestDatabaseNoKey',
        db: () => new TestDatabaseNoKey('TestDatabaseNoKey')
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
