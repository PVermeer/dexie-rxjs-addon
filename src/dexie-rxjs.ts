// tslint:disable: unified-signatures
import Dexie from 'dexie';
import 'dexie-observable';
import { addProperties } from './add-properties';

export function dexieRxjs(db: Dexie) {

    addProperties(db);

}
