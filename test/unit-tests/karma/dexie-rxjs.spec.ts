// tslint:disable: no-non-null-assertion
import Dexie from 'dexie';
import faker from 'faker/locale/nl';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { databasesPositive, Friend, methods, mockFriends } from '../../mocks/mocks';

describe('Rxjs', () => {
    databasesPositive.forEach((database, _i) => {
        // if (_i !== 3) { return; }
        describe(database.desc, () => {
            let db: ReturnType<typeof database.db>;
            let subs: Subscription;
            beforeEach(async () => {
                subs = new Subscription();
                db = database.db(Dexie);
                await db.open();
                expect(db.isOpen()).toBeTrue();
            });
            afterEach(async () => {
                subs.unsubscribe();
                await db.delete();
            });
            describe('db.changes$', () => {
                it('should be an observable', () => {
                    expect(db.changes$ instanceof Observable).toBeTrue();
                });
                it('should be open', async () => {
                    let sub = new Subscription();
                    const emitPromise = new Promise(resolve => {
                        sub = subs.add(db.changes$.subscribe(
                            () => resolve()
                        ));
                    });
                    await db.friends.bulkAdd(mockFriends(1));
                    await emitPromise;
                    expect(sub.closed).toBe(false);
                });
                it(`should have same behavior as db.on('changes')`, async () => {
                    const emitEventPromise = new Promise(resolve => {
                        db.on('changes').subscribe(
                            data => resolve(data)
                        );
                    });
                    const emitObsPromise = new Promise(resolve => {
                        subs.add(db.changes$.subscribe(
                            data => resolve(data)
                        ));
                    });
                    await db.friends.bulkAdd(mockFriends(1));
                    const resolved = await Promise.all([emitObsPromise, emitEventPromise]);
                    expect(resolved[0]).toEqual(resolved[1]);
                });
            });
            describe('Methods', () => {
                methods.forEach(method => {
                    let friend: Friend;
                    let id: number;
                    let updateId: number;
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
                            updateId = database.desc !== 'TestDatabaseCustomKey' && id > 1000000 ? 1 : id;
                            method$ = method.method(db);
                            obs$ = method$(id);
                        });
                        it('should be an observable', async () => {
                            expect(obs$ instanceof Observable).toBeTrue();
                        });
                        it('should be open', async () => {
                            let sub = new Subscription();
                            const emitPromise = new Promise(resolve => {
                                sub = subs.add(obs$.subscribe(
                                    () => resolve()
                                ));
                            });
                            await emitPromise;
                            expect(sub.closed).toBe(false);
                        });
                        it('should emit the correct value', async () => {
                            const getFriend = await obs$.pipe(take(1)).toPromise();
                            expect(getFriend).toEqual(friend);

                            const [newFriend] = mockFriends(1);
                            const newId = await addFriend(newFriend);
                            const obsNew$ = method$(newId);
                            const getNewFriend = await obsNew$.pipe(take(1)).toPromise();
                            expect(getNewFriend).toEqual(newFriend);

                            const obsOld$ = method$(id);
                            const getOldFriend = await obsOld$.pipe(take(1)).toPromise();
                            expect(getOldFriend).toEqual(friend);
                        });
                        it('should emit with auto key (++id)', async () => {
                            const getFriend = await obs$.pipe(take(1)).toPromise();

                            const [newFriend] = mockFriends(1);
                            const newId = await addFriend(newFriend);
                            const obsNew$ = method$(newId);
                            const getNewFriend = await obsNew$.pipe(take(1)).toPromise();

                            const obsOld$ = method$(id);
                            const getOldFriend = await obsOld$.pipe(take(1)).toPromise();

                            switch (database.desc) {
                                case 'TestDatabaseKeyPath': {
                                    expect(getFriend).toEqual(jasmine.objectContaining({ some: { id } }));
                                    expect(getNewFriend).toEqual(jasmine.objectContaining({ some: { id: newId } }));
                                    expect(getOldFriend).toEqual(jasmine.objectContaining({ some: { id } }));
                                    break;
                                }
                                case 'TestDatabaseCustomKey': {
                                    expect(getFriend!.id).toBeUndefined();
                                    expect(getNewFriend!.id).toBeUndefined();
                                    expect(getOldFriend!.id).toBeUndefined();

                                    expect(getFriend).toEqual(jasmine.objectContaining({ customId: id }));
                                    expect(getNewFriend).toEqual(jasmine.objectContaining({ customId: newId }));
                                    expect(getOldFriend).toEqual(jasmine.objectContaining({ customId: id }));
                                    break;
                                }
                                case 'TestDatabaseNoKey': {
                                    expect(getFriend!.id).toBeUndefined();
                                    expect(getNewFriend!.id).toBeUndefined();
                                    expect(getOldFriend!.id).toBeUndefined();
                                    break;
                                }
                                default: {
                                    expect(getFriend).toEqual(jasmine.objectContaining({ id }));
                                    expect(getNewFriend).toEqual(jasmine.objectContaining({ id: newId }));
                                    expect(getOldFriend).toEqual(jasmine.objectContaining({ id }));
                                }
                            }
                        });
                        it('should emit on record update', async () => {
                            let emitCount = 0;
                            let obsFriend: Friend | undefined;
                            const emitPromise = new Promise(resolve => {
                                subs.add(method$(id).subscribe(
                                    friendEmit => {
                                        emitCount++;
                                        obsFriend = friendEmit;
                                        if (emitCount === 2) { resolve(); }
                                    }
                                ));
                            });
                            await db.friends.update(updateId, { firstName: 'TestieUpdate' });
                            await emitPromise;
                            expect(obsFriend).toEqual({ ...friend, firstName: 'TestieUpdate' });
                        });
                        it('should emit undefined on record delete', async () => {
                            let emitCount = 0;
                            let obsFriend: Friend | undefined;

                            const waits = new Array(2).fill(null).map(() => flatPromise());
                            subs.add(method$(id).subscribe(
                                friendEmit => {
                                    emitCount++;
                                    obsFriend = friendEmit;
                                    switch (emitCount) {
                                        case 1: waits[0].resolve(); break;
                                        case 2: waits[1].resolve(); break;
                                    }
                                }));

                            await waits[0].promise;
                            expect(obsFriend).toEqual(friend);
                            await db.friends.delete(updateId);
                            await waits[1].promise;
                            expect(obsFriend).toBe(undefined);
                        });
                        it('should emit undefined when id is not found', async () => {
                            let emitCount = 0;
                            let obsFriend: Friend | undefined;
                            const emitPromise = new Promise(resolve => {
                                subs.add(method$(99999999).subscribe(
                                    friendEmit => {
                                        emitCount++;
                                        obsFriend = friendEmit;
                                        if (emitCount === 1) { resolve(); }
                                    }
                                ));
                            });
                            await emitPromise;
                            expect(obsFriend).toBe(undefined);
                        });
                        it('should emit when record is created after subscribe', async () => {
                            const friends = mockFriends(50);
                            let emitCount = 0;
                            let obsFriend: Friend | undefined;
                            const emitPromise = new Promise(resolve => {
                                subs.add(method$(
                                    database.desc === 'TestDatabaseCustomKey' ||
                                        (database.desc === 'TestDatabaseNoKey' && method.desc === 'Table.$') ?
                                        friends[12].customId :
                                        13
                                ).subscribe(
                                    friendEmit => {
                                        emitCount++;
                                        obsFriend = friendEmit;
                                        if (emitCount === 2) { resolve(); }
                                    }
                                ));
                            });
                            const ids = await Promise.all(friends.map(x => addFriend(x)));
                            const index = ids.findIndex(x => x === 13 || x === friends[12].customId);
                            await emitPromise;
                            expect(obsFriend).toEqual(friends[index]);
                        });
                        // Specific test per method
                        switch (method.desc) {
                            case 'Table.$': {
                                it('should be an array', async () => {
                                    const table = await db.friends.$.pipe(take(1)).toPromise();
                                    expect(table).toEqual([friend]);
                                });
                                it('should emit on adding/removing to the table', async () => {
                                    const table$ = db.friends.$;
                                    let table: Friend[];
                                    let emitCount = 0;
                                    const waits = new Array(3).fill(null).map(() => flatPromise());
                                    subs.add(table$.subscribe(emit => {
                                        table = emit;
                                        emitCount++;
                                        switch (emitCount) {
                                            case 1: waits[0].resolve(); break;
                                            case 2: waits[1].resolve(); break;
                                            case 3: waits[2].resolve(); break;
                                        }
                                    }));

                                    await waits[0].promise;
                                    expect(emitCount).toBe(1);
                                    expect(table!).toEqual([friend]);

                                    const friends = mockFriends(9);
                                    await Promise.all(friends.map(x => db.friends.add(x)));
                                    await waits[1].promise;
                                    expect(emitCount).toBe(2);
                                    expect(table!).toEqual(jasmine.arrayContaining([
                                        friend,
                                        ...friends.map(x => jasmine.objectContaining(x))
                                    ]));
                                    expect(table!.length).toBe(10);

                                    await db.friends.delete(updateId);
                                    await waits[2].promise;
                                    expect(emitCount).toBe(3);
                                    expect(table!).toEqual(jasmine.arrayContaining(
                                        friends.map(x => jasmine.objectContaining(x))
                                    ));
                                    expect(table!.length).toBe(9);
                                });
                                it('should emit on updating a record on the table', async () => {
                                    const table$ = db.friends.$;
                                    let table: Friend[];
                                    let emitCount = 0;
                                    const waits = new Array(2).fill(null).map(() => flatPromise());
                                    subs.add(table$.subscribe(emit => {
                                        table = emit;
                                        emitCount++;
                                        switch (emitCount) {
                                            case 1: waits[0].resolve(); break;
                                            case 2: waits[1].resolve(); break;
                                        }
                                    }));

                                    await waits[0].promise;
                                    expect(emitCount).toBe(1);
                                    expect(table!).toEqual([friend]);

                                    await db.friends.update(updateId, { lastName: 'TestieTest' });
                                    await waits[1].promise;
                                    expect(emitCount).toBe(2);
                                    expect(table!).toEqual([{ ...friend, lastName: 'TestieTest' }]);
                                });
                                it('should not emit on updating a record on the table with same data', async () => {
                                    const table$ = db.friends.$;
                                    let table: Friend[];
                                    let emitCount = 0;
                                    const waits = new Array(2).fill(null).map(() => flatPromise());
                                    subs.add(table$.subscribe(emit => {
                                        table = emit;
                                        emitCount++;
                                        switch (emitCount) {
                                            case 1: waits[0].resolve(); break;
                                            case 2: waits[1].resolve(); break;
                                        }
                                    }));

                                    await waits[0].promise;
                                    expect(table!).toEqual([friend]);

                                    await db.friends.update(updateId, { lastName: friend.lastName });
                                    setTimeout(() => waits[1].resolve(), 500);
                                    await waits[1].promise;
                                    expect(emitCount).toBe(1);
                                    expect(table!).toEqual([friend]);
                                });
                                break;
                            }
                            default: {
                                it('should not emit when no changes', async () => {
                                    const friends = mockFriends(50);
                                    const updateFriends = [...friends.map(x => {
                                        const { customId, ...rest } = x;
                                        return rest;
                                    })];
                                    const ids = await Promise.all(friends.map(x => addFriend(x)));

                                    const idx1 = faker.random.number({ min: 0, max: 9 });
                                    const id1 = ids[idx1];
                                    let emitCount = 0;

                                    const waits = new Array(4).fill(null).map(() => flatPromise());
                                    subs.add(method$(id1).subscribe(
                                        () => {
                                            emitCount++;
                                            switch (emitCount) {
                                                case 1:
                                                    waits[0].resolve();
                                                    break;
                                                case 2:
                                                    waits[1].resolve();
                                                    waits[2].resolve();
                                                    waits[3].resolve();
                                                    break;
                                            }
                                        }
                                    ));
                                    // First emit
                                    await waits[0].promise;
                                    expect(emitCount).toBe(1);

                                    // Update different record
                                    const idx2 = faker.random.number({ min: 10, max: 19 });
                                    const id2 = ids[idx2];
                                    await db.friends.update(id2, updateFriends[idx2]);
                                    setTimeout(() => waits[1].resolve(), 500);
                                    await waits[1].promise;
                                    expect(emitCount).toBe(1);

                                    // Update record with same data
                                    await db.friends.update(id1, updateFriends[idx1]);
                                    setTimeout(() => waits[2].resolve(), 500);
                                    await waits[2].promise;
                                    expect(emitCount).toBe(1);

                                    // Update record with different data
                                    await db.friends.update(id1, updateFriends[49]);
                                    await waits[3].promise;
                                    expect(emitCount).toBe(2);
                                });
                            }
                        }
                    });
                });
            });
        });
    });
});

// ========== Helper functions ===========
function flatPromise() {

    let resolve!: () => void;
    let reject!: () => void;

    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}
