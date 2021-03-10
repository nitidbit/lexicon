import { Collection, KeyPath, KeyPathString } from './collection';
export declare type ContentByLocale = {
    [localeCode: string]: Collection;
};
declare type LocaleCode = string;
export declare class Lexicon {
    private _contentByLocale;
    currentLocaleCode: LocaleCode;
    private _filename;
    private _subsetRoot;
    constructor(contentByLocale: ContentByLocale, localeCode: LocaleCode, filename: string, subset?: KeyPath);
    locale(localeCode: LocaleCode): Lexicon | null;
    addSubLexicon(subLexicon: Lexicon, subLexiconName: string): void;
    get(keyPath: KeyPath, templateSubstitutions?: object): any;
    getExact(keyPath: KeyPath): any;
    subset(keyPath: KeyPath): Lexicon | null;
    private fullKey;
    private find;
    source(keyPath: KeyPath): {
        filename: any;
        localPath: any[];
        updatePath: any;
    };
    locales(): Array<LocaleCode>;
    filename(): string;
    keys(): Array<KeyPathString>;
    update(updatePath: KeyPath, newValue: any): boolean;
    cloneDeep(): Lexicon;
    clone(): Lexicon;
}
export {};
