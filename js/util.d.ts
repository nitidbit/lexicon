export interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {
}
export declare const flattenMap: <T>(map: NestedMap<string, T>) => string[];
export declare const cloneNestedMap: <K, V>(map: NestedMap<K, V>) => NestedMap<K, V>;
export declare const evaluateTemplate: (template: string, substitutions: object) => string;
