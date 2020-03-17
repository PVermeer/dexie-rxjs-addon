import Dexie from 'dexie';
import { ObservableCollection, ObservableWhereClause } from '../../../src';
import { databasesPositive } from '../../mocks/mocks';

describe('ObservableWhereClause class', () => {
    it('should have new Collection getter', async () => {
        const db = databasesPositive[0].db(Dexie);
        await db.open();
        const whereClause = db.friends.where(':id');
        const whereClass = new ObservableWhereClause(db, db.friends, whereClause);
        expect(whereClass.Collection instanceof ObservableCollection);
    });
    it(`should have the correct constructor`, async () => {
        const db = databasesPositive[0].db(Dexie);
        await db.open();
        const whereClause = db.friends.where(':id');
        const whereClass = new ObservableWhereClause(db, db.friends, whereClause);
        expect(whereClass.constructor.name).toBe('ObservableWhereClause');

        (whereClause as any).constructor = function Test() { };
        const whereClass2 = new ObservableWhereClause(db, db.friends, whereClause);
        expect(whereClass2.constructor.name).toBe('ObservableWhereClause');
    });
});
