import { KeyPath } from './util';
declare type LocaleCode = string;
export declare type ContentByLocale = {
    [localeCode: string]: object | Map<any, any>;
};
export declare class Lexicon {
    private _contentByLocale;
    currentLocaleCode: LocaleCode;
    private _filename;
    private _rootKeyPath;
    constructor(contentByLocale: ContentByLocale, localeCode: LocaleCode, filename: string, subset?: KeyPath);
    locale(localeCode: LocaleCode): Lexicon | null;
    get(keyPath: KeyPath, templateSubstitutions?: object): any;
    subset(keyPath: KeyPath): Lexicon | null;
    private fullKey;
    private find;
    source(keyPath: KeyPath): {
        filename: string;
        keyPath: KeyPath;
    } | null;
    locales(): Array<LocaleCode>;
    filename(): string;
    keys(): Array<string>;
    update(keyPath: KeyPath, newValue: any, locale?: LocaleCode): boolean;
    clone(): Lexicon;
}
export {};
