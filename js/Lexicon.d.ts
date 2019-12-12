import { NestedMap } from './util';
export declare type RawLexiconObject = {
    [key: string]: string | Array<RawLexiconObject> | RawLexiconObject;
};
export declare type RawLexiconMap = NestedMap<string, string>;
export declare type Locales = Map<string, RawLexiconMap>;
export declare type LocalesObject = {
    [lang: string]: RawLexiconObject;
};
export declare class Lexicon {
    private _locales;
    defaultLocale: string;
    filename: string;
    constructor(_locales: LocalesObject | Locales, defaultLocale: string, filename: string);
    locale(languageCode: string): Lexicon | null;
    locales(): Array<string>;
    get(key: string, templateSubstitutions?: unknown): string | null;
    subset(path: string): Lexicon | null;
    keys(): Array<string>;
    update(key: string, newValue: string, locale?: string): boolean;
    clone(): Lexicon;
    asObject(): LocalesObject;
}
