import type DexieType from 'dexie';
import type { Table } from 'dexie';
import * as rxjsImport from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';
import type { dexieRxjs } from '../../../src/index';
import { Friend, mockFriends } from '../../mocks/mocks';

declare interface DexieRxjsAddon { dexieRxjs: typeof dexieRxjs; }
declare const Dexie: typeof DexieType;
declare const rxjs: typeof rxjsImport & { operators: typeof rxjsOperators };
declare const DexieRxjsAddon: DexieRxjsAddon;

type TestDatabase = DexieType & { friends: Table<Friend, number> };

describe('HTML script tag', () => {
    beforeAll(async () => {
        await Promise.all([
            await new Promise(resolve => {
                const script = document.createElement('script');
                console.warn('Still using dexie@next HTML import !!!!!!!!!!!!!!!!!!!!!!!!');
                script.src = 'https://unpkg.com/dexie@next/dist/dexie.js';
                script.type = 'text/javascript';
                script.onload = () => resolve();
                document.head.append(script);
            }),
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/rxjs/bundles/rxjs.umd.min.js';
                script.type = 'text/javascript';
                script.onload = () => resolve();
                document.head.append(script);
            })
        ]);
        await new Promise(resolve => {
            const script = document.createElement('script');
            script.src = `/base/dist/dexie-rxjs-addon.min.js`;
            script.type = 'text/javascript';
            script.onload = () => resolve();
            document.head.append(script);
        });
    });
    it('should load Dexie.js', () => {
        expect(Dexie).toBeTruthy();
    });
    it('should load RxJs', () => {
        expect(rxjs).toBeTruthy();
        expect(rxjs.operators).toBeTruthy();
    });
    it('should load the addon', () => {
        expect(DexieRxjsAddon).toBeTruthy();
        expect(DexieRxjsAddon.dexieRxjs).toBeTruthy();
    });
    let db: TestDatabase;
    let subs: rxjsImport.Subscription;
    beforeEach(async () => {
        subs = new rxjs.Subscription();
        db = new Dexie('Test Database HTML', { addons: [DexieRxjsAddon.dexieRxjs] }) as any;
        db.on('blocked', () => false);
        db.version(1).stores({
            friends: '++id, customId, firstName, lastName, shoeSize, age, [age+shoeSize]'
        });
        await db.open();
        expect(db.isOpen()).toBeTrue();
    });
    afterEach(async () => {
        subs.unsubscribe();
        await db.delete();
    });
    it('should be able to use normally', async () => {
        const [friend] = mockFriends(1);
        const id = await db.friends.add(friend);
        const getFriend = await db.friends.get(id);
        expect(getFriend).toEqual(friend);
        await db.delete();
    });
    it('should be able to use observables', async () => {
        const [friend] = mockFriends(1);
        const id = await db.friends.add(friend);
        const getFriend = await db.friends.$.get(id).pipe(rxjs.operators.take(1)).toPromise();
        expect(getFriend).toEqual(friend);
    }, 99999);
});
