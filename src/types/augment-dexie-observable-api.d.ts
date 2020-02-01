export { DatabaseChangeType, ICreateChange, IDatabaseChange, IDeleteChange, IUpdateChange } from 'dexie-observable/api'

declare module 'dexie-observable/api' {
    interface IUpdateChange {
        oldObj: any;
        obj: any;
    }
}
