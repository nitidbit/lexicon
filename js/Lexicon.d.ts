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
    currentLocaleCode: string;
    private _filename;
    constructor(_locales: LocalesObject | Locales, localeCode: string, filename: string);
    locale(languageCode: LocaleCode): Lexicon | null;
    locales(): Array<LocaleCode>;
    filename(): string;
    get(key: NestedKey, templateSubstitutions?: object): string | null;
    subset(nestedKey: NestedKey): Lexicon | null;
    keys(): Array<string>;
    update(key: string, newValue: string, locale?: LocaleCode): boolean;
    clone(): Lexicon;
    asObject(): LocalesObject;
}
export {};
