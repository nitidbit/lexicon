import { NestedMap } from './util';
export declare type RawLexicon = NestedMap<string, string>;
export declare type RawLexiconObject = {
    [key: string]: string | Array<RawLexiconObject> | RawLexiconObject;
};
export declare type Locales = Map<string, RawLexicon>;
export declare type LocalesObject = {
    [lang: string]: RawLexiconObject;
};
export declare class Lexicon {
    private _locales;
    defaultLocale: string;
    constructor(_locales: LocalesObject | Locales, defaultLocale: string);
    locale(locale: string): Lexicon | null;
    locales(): Array<string>;
    get(key: string, data?: unknown): string | null;
    subset(path: string): Lexicon | null;
    keys(): Array<string>;
    update(key: string, newValue: string, locale?: string): boolean;
    clone(): Lexicon;
}
