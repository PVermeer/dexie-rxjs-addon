import Dexie from 'dexie';
import { ObservableCollection } from '../../../src';
import { databasesPositive } from '../../mocks/mocks';

describe('ObservableCollection class', () => {
    it('should be mixed in with WhereClause', async () => {
        const db = databasesPositive[0].db(Dexie);
        await db.open();
        const collection = db.friends.where(':id').anyOf();
        expect(collection).toBeTruthy();
    });
    it(`should have the correct constructor`, async () => {
        const db = databasesPositive[0].db(Dexie);
        await db.open();
        const collection = db.friends.where(':id').anyOf();
        const collectionClass = new ObservableCollection(db, db.friends, collection);
        expect(collectionClass.constructor.name).toBe('ObservableCollection');

        (collection as any).constructor = function Test() { };
        const whereClass2 = new ObservableCollection(db, db.friends, collection);
        expect(whereClass2.constructor.name).toBe('ObservableCollection');
    });
});
