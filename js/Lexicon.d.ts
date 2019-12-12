import { NestedMap } from './util';
declare type LocaleCode = string;
declare type NestedKey = Array<LocaleCode> | string;
export declare type RawLexiconObject = {
    [key: string]: null | string | number | boolean | object | Array<any>;
};
export declare type RawLexiconMap = NestedMap<string, any>;
export declare type Locales = Map<LocaleCode, RawLexiconMap>;
export declare type LocalesObject = {
    [lang: string]: RawLexiconObject;
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
    subset(nestedKey: string): Lexicon | null;
    keys(): Array<string>;
    update(key: string, newValue: string, locale?: LocaleCode): boolean;
    clone(): Lexicon;
    asObject(): LocalesObject;
}
export {};
