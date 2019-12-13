export interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {
}
export declare const flattenMap: <T>(map: NestedMap<string, T>) => string[];
export declare const cloneNestedMap: <K, V>(map: NestedMap<K, V>) => NestedMap<K, V>;
export declare type Collection = Map<string, any> | Array<any> | object;
export declare function isCollection(maybeCollection: any): boolean;
export declare function keys(c: Collection): string[] | IterableIterator<string>;
export declare function entries(c: Collection): IterableIterator<[string, any]> | [string, any][];
export declare const evaluateTemplate: (template: string, substitutions: object) => string;
