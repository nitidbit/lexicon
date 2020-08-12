export declare type Collection = Map<any, any> | Array<any> | object;
export declare type KeyPathArray = Array<string>;
export declare type KeyPathString = string;
export declare type KeyPath = KeyPathArray | KeyPathString;
export declare function keyPathAsArray(keyPath: KeyPath): Array<string>;
export declare function keyPathAsString(keyPath: KeyPath): string;
export declare function isCollection(maybeCollection: any): boolean;
export declare function get(data: Collection, keyPath: KeyPath): any;
export declare function keys(c: Collection): Array<string>;
export declare function entries(c: Collection): Array<[any, any]>;
export declare function has(c: Collection, key: KeyPath): boolean;
export declare function set(c: Collection, key: KeyPath, value: any): Collection;
export declare function size(c: Collection): Number;