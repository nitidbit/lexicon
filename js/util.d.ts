export interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {
}
export declare const flattenMap: <T>(map: NestedMap<string, T>) => string[];
export declare const cloneNestedMap: <K, V>(map: NestedMap<K, V>) => NestedMap<K, V>;
export declare type Collection = Map<any, any> | Array<any> | object;
export declare type NestedKey = Array<any> | string;
export declare function isCollection(maybeCollection: any): boolean;
export declare function get(data: Collection, nestedKey: NestedKey): any;
export declare function keys(c: Collection): Array<string>;
export declare function entries(c: Collection): Array<[any, any]>;
export declare function has(c: Collection, key: any): boolean;
export declare function set(c: Collection, key: any, value: any): Collection;
export declare function size(c: Collection): Number;
export declare function clone(c: Collection): any;
export declare const evaluateTemplate: (template: string, substitutions: object) => string;
