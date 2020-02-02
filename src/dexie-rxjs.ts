// tslint:disable: unified-signatures
import Dexie from 'dexie';
import 'dexie-observable';
import { addChanges$, addGet$ } from './add-properties';

export function dexieRxjs(db: Dexie) {

    addChanges$(db);
    addGet$(db);

}
