// tslint:disable: no-non-null-assertion
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { databasesPositive, Friend, mockFriends } from '../../mocks/mocks';

describe('Rxjs', () => {
    databasesPositive.forEach(database => {
        describe(database.desc, () => {
            let db: ReturnType<typeof database.db>;
            let subs: Subscription;
            beforeEach(async () => {
                subs = new Subscription();
                db = database.db();
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
            describe('get$()', () => {
                let friend: Friend;
                let id: number;
                beforeEach(async () => {
                    friend = mockFriends(1)[0];
                    id = await db.friends.add(friend);
                });
                it('should be an observable', async () => {
                    const obs$ = db.friends.get$(id);
                    expect(obs$ instanceof Observable).toBeTrue();
                });
                it('should be open', async () => {
                    let sub = new Subscription();
                    const emitPromise = new Promise(resolve => {
                        sub = subs.add(db.friends.get$(id).subscribe(
                            () => resolve()
                        ));
                    });
                    await emitPromise;
                    expect(sub.closed).toBe(false);
                });
                it('should emit the correct value', async () => {
                    const obs$ = db.friends.get$(id);
                    const getFriend = await obs$.pipe(take(1)).toPromise();
                    expect(getFriend).toEqual(friend);

                    const [newFriend] = mockFriends(1);
                    const newId = await db.friends.add(newFriend);
                    const obsNew$ = db.friends.get$(newId);
                    const getNewFriend = await obsNew$.pipe(take(1)).toPromise();
                    expect(getNewFriend).toEqual(newFriend);

                    const obsOld$ = db.friends.get$(id);
                    const getOldFriend = await obsOld$.pipe(take(1)).toPromise();
                    expect(getOldFriend).toEqual(friend);
                });
                it('should emit with auto key (++id)', async () => {
                    const obs$ = db.friends.get$(id);
                    const getFriend = await obs$.pipe(take(1)).toPromise();

                    const [newFriend] = mockFriends(1);
                    const newId = await db.friends.add(newFriend);
                    const obsNew$ = db.friends.get$(newId);
                    const getNewFriend = await obsNew$.pipe(take(1)).toPromise();

                    const obsOld$ = db.friends.get$(id);
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
                        subs.add(db.friends.get$(id).subscribe(
                            friendEmit => {
                                emitCount++;
                                obsFriend = friendEmit;
                                if (emitCount === 2) { resolve(); }
                            }
                        ));
                    });
                    await db.friends.update(id, { firstName: 'TestieUpdate' });
                    await emitPromise;
                    expect(obsFriend).toEqual({ ...friend, firstName: 'TestieUpdate' });
                });
                it('should emit undefined on record delete', async () => {
                    let emitCount = 0;
                    let obsFriend: Friend | undefined;
                    const emitPromise = new Promise(resolve => {
                        subs.add(db.friends.get$(id).subscribe(
                            friendEmit => {
                                emitCount++;
                                obsFriend = friendEmit;
                                if (emitCount === 2) { resolve(); }
                            }
                        ));
                    });
                    await db.friends.delete(id);
                    await emitPromise;
                    expect(obsFriend).toBe(undefined);
                });
                it('should emit undefined when id is not found', async () => {
                    let emitCount = 0;
                    let obsFriend: Friend | undefined;
                    const emitPromise = new Promise(resolve => {
                        subs.add(db.friends.get$(99999999).subscribe(
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
                    let emitCount = 0;
                    let obsFriend: Friend | undefined;
                    const emitPromise = new Promise(resolve => {
                        subs.add(db.friends.get$(2).subscribe(
                            friendEmit => {
                                emitCount++;
                                obsFriend = friendEmit;
                                if (emitCount === 2) { resolve(); }
                            }
                        ));
                    });
                    const [newFriend] = mockFriends(1);
                    await db.friends.add(newFriend); // should be key 2
                    await emitPromise;
                    expect(obsFriend).toEqual(newFriend);
                });
            });
        });
    });
});
