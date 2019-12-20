import { NestedKey } from './util';
declare type LocaleCode = string;
export declare type RawLexiconObject = {
    [key: string]: null | string | number | boolean | object | Array<any>;
};
export declare type RawLexiconMap = {
    [lang: string]: object | Map<any, any>;
};
export declare type Locales = LocalesObject;
export declare type LocalesObject = {
    [lang: string]: object | Map<any, any>;
};
export declare class Lexicon {
    private _contentByLocale;
    currentLocaleCode: LocaleCode;
    private _filename;
    private _rootKeyPath;
    constructor(contentByLocale: LocalesObject | Locales, localeCode: LocaleCode, filename: string, subset?: NestedKey);
    locale(localeCode: LocaleCode): Lexicon | null;
    locales(): Array<LocaleCode>;
    filename(): string;
    get(key: NestedKey, templateSubstitutions?: object): string | null;
    private _fullKey;
    subset(nestedKey: NestedKey): Lexicon | null;
    source(nestedKey: NestedKey): {
        filename: string;
        nestedKey: NestedKey;
    };
    keys(): Array<string>;
    update(key: string, newValue: any, localeCode?: LocaleCode): boolean;
    clone(): Lexicon;
    asObject(): LocalesObject;
}
export {};
