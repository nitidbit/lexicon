export declare type Lexicon = any;
declare type LexiconSubShape = {
    [key: string]: string;
};
export declare class LexiconShape {
    _LexiconShapeName: string;
    _isLeafItem: boolean;
    _arrayShape: any;
    _filename?: string;
    constructor(name: string, shape: object | 'LeafItem', filename?: string);
    toString(): string;
    inspect(): string;
    name(): string;
    extract(textContent: Lexicon): any;
    flatShape(shape: LexiconShape, prefix?: string): FlatShape;
    fileAndKeyFor(ikey: DottedKey, root?: LexiconShape | LexiconSubShape): [string | undefined, DottedKey];
}
export declare const ShortString: LexiconShape;
export declare const LongString: LexiconShape;
export declare type FlatShape = Array<[DottedKey, LexiconShape]>;
export declare type DottedKey = string;
export {};
