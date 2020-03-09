
type Unpacked<T> =
T extends (infer U)[] ? U :
T extends (...args: any[]) => infer V ? V :
T extends Promise<infer W> ? W :
never;

type OmitMethods<T> = Pick<T, { [P in keyof T]: T[P] extends (...args: any[]) => any ? never : P; }[keyof T]>;

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

type TypeName<T> =
T extends string ? 'string' :
T extends number ? 'number' :
T extends boolean ? 'boolean' :
T extends null ? 'null' :
T extends undefined ? 'undefined' :
T extends any[] ? 'array' :
T extends (...args: any[]) => any ? 'function' :
'object';

type ValuesOf<T> = T[keyof T];

type UnionToIntersection<U> =
(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I
: never;

type IsObject<T, O = TypeName<T>> =
IsUnion<O> extends true ? false :
O extends 'object' ? true :
false;

// ==== Flatten object ====
type NonObjectKeysOf<T> = {
[K in keyof T]: IsObject<T[K]> extends false ? K : never
}[keyof T];
type NonObjectPropertiesOf<T> = Pick<T, NonObjectKeysOf<T>>;
type ObjectValuesOf<T> = ValuesOf<Omit<T, NonObjectKeysOf<T>>>;

type FlattenOnce<T> = NonObjectPropertiesOf<T> &
UnionToIntersection<ObjectValuesOf<T>>;

type FlattenDeepRecursive<T, KeepOriginal> = {
[K in keyof T]:
IsObject<T[K]> extends false ? T[K] :
FlattenDeep<T[K], KeepOriginal>
};
type FlattenDeep<T, KeepOriginal = undefined> =
KeepOriginal extends true ?
T & FlattenOnce<FlattenDeepRecursive<T, KeepOriginal>> :
FlattenOnce<FlattenDeepRecursive<T, KeepOriginal>>;

type Flatten<T, KeepOriginal extends boolean = false> = FlattenDeep<Required<T>, KeepOriginal>;
// =====================
