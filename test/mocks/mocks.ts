import Dexie from 'dexie';
import { dexieRxjs } from '../../src';
import faker from 'faker/locale/nl';

export interface Friend {
    id?: string;
    testProp?: string;
    hasAge?: boolean;
    firstName: string;
    lastName: string;
    shoeSize: number;
}

export class TestDatabase extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++id, firstName, lastName, shoeSize, age'
        });
    }
}
export class TestDatabaseKeyPath extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: '++some.id, firstName, lastName, shoeSize, age'
        });
    }
}
export class TestDatabaseCustomKey extends Dexie {
    public friends: Dexie.Table<Friend, number>;
    constructor(name: string) {
        super(name);
        dexieRxjs(this);
        this.version(1).stores({
            friends: 'customId, firstName, lastName, shoeSize, age'
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
    }
];

export const mockFriends = (count: number = 5): Friend[] => {
    const friend = () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        age: faker.random.number({ min: 1, max: 80 }),
        shoeSize: faker.random.number({ min: 5, max: 12 }),
        customId: faker.random.alphaNumeric(20)
    });
    return new Array(count).fill(null).map(() => friend());
};
