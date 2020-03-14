import { Dexie, TableSchema, Transaction } from 'dexie';
import { ObservableTable } from './observableTable.class';
import { DexieExtended } from './types';

export interface TableExtended<T, TKey> {
    $: ObservableTable<T, TKey>;
}

export function getTableExtended<T, TKey>(db: Dexie) {

    const TableClass = db.Table as DexieExtended['Table'];

    return class TableExt extends TableClass<T, TKey> implements TableExtended<T, TKey> {

        public $: ObservableTable<T, TKey> = new ObservableTable<T, TKey>(db, this);

        constructor(
            _name: string,
            _tableSchema: TableSchema,
            _optionalTrans: Transaction | undefined
        ) {
            super(_name, _tableSchema, _optionalTrans);
        }

    };

}
