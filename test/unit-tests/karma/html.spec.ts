import DexieType from 'dexie';
import * as rxjsImport from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';
import { dexieRxjs } from '../../../src/index';
import { databasesPositive, Friend, methods, mockFriends } from '../../mocks/mocks';

declare interface DexieRxjsAddon { dexieRxjs: typeof dexieRxjs; }
declare const Dexie: typeof DexieType;
declare const rxjs: typeof rxjsImport & { operators: typeof rxjsOperators };
declare const DexieRxjsAddon: DexieRxjsAddon;

describe('HTML script tag', () => {
    beforeAll(async () => {
        await Promise.all([
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/dexie@latest/dist/dexie.js';
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
    databasesPositive.forEach((database, _i) => {
        // if (_i !== 2) { return; }
        describe(database.desc, () => {
            let db: ReturnType<typeof database.db>;
            let subs: rxjsImport.Subscription;
            beforeEach(async () => {
                subs = new rxjs.Subscription();
                db = database.db(Dexie);
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
            describe('Methods', () => {
                methods.forEach(method => {
                    let friend: Friend;
                    let id: number;
                    let method$: ReturnType<typeof method.method>;
                    let obs$: ReturnType<ReturnType<typeof method.method>>;

                    const addFriend = (friendToAdd: Friend) => db.friends.add(friendToAdd)
                        .then(newId => {
                            switch (database.desc) {
                                case 'TestDatabaseNoKey': return method.desc === 'Table.$' ? friendToAdd.customId : newId;
                                default: return newId;
                            }
                        });

                    describe(method.desc, () => {
                        beforeEach(async () => {
                            friend = mockFriends(1)[0];
                            id = await addFriend(friend);
                            method$ = method.method(db);
                            obs$ = method$(id);
                        });
                        it('should be able to use observables', async () => {
                            const getFriend = await obs$.pipe(rxjs.operators.take(1)).toPromise();
                            expect(getFriend).toEqual(friend);
                        });
                    });
                });
            });
        });
    });
});
