// tslint:disable: unified-signatures
import Dexie from 'dexie';
import 'dexie-observable';
import { addChanges$, addGet$, addWhere$ } from './add-properties';

export function dexieRxjs(db: Dexie) {

    addChanges$(db);
    addGet$(db);
    addWhere$(db);

}
