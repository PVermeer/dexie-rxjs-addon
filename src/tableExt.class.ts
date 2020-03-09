import { TableSchema, Transaction } from 'dexie';
import { ObservableTable } from './observableTable.class';
import { DexieExtended } from './types/types';

export interface TableExtended<T, TKey> {
    $: ObservableTable<T, TKey>;
}

export function getTableExtended<T, TKey>(db: DexieExtended) {

    const TableClass = db.Table;

    return class TableExt extends TableClass<T, TKey> implements TableExtended<T, TKey> {

        public db: DexieExtended;

        public $: ObservableTable<T, TKey> = new ObservableTable<T, TKey>(this.db, this);

        constructor(
            _name: string,
            _tableSchema: TableSchema,
            _optionalTrans: Transaction | undefined
        ) {
            super(_name, _tableSchema, _optionalTrans);
        }

    };

}
