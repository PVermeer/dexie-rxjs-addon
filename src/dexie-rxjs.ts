// tslint:disable: unified-signatures
import Dexie from 'dexie';
import 'dexie-observable';
import { addChanges$, addGet$, addTable$, addWhere$ } from './add-properties';

export function dexieRxjs(db: Dexie) {

    db.on('ready', () => {
        const unSupported = db.tables.some(table =>
            [table.schema.primKey, ...table.schema.indexes].some(index => index.compound || index.multi)
            , false);

        if (unSupported) {
            throw new Error('Compound or multi indices are not (yet) supported');
        }
    });

    addChanges$(db);
    addGet$(db);
    addWhere$(db);
    addTable$(db);

}
