interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {
}
export declare type RawLexicon = NestedMap<string, string>;
export declare type RawLexiconObject = {
    [key: string]: string | Array<RawLexiconObject> | RawLexiconObject;
};
export declare type Locales = Map<string, RawLexicon>;
export declare type LocalesObject = {
    [lang: string]: RawLexiconObject;
};
export declare class Lexicon {
    private locales;
    defaultLocale: string;
    constructor(locales: LocalesObject | Locales, defaultLocale: string);
    locale(locale: string): Lexicon | null;
    get(key: string): string | null;
    subset(path: string): Lexicon | null;
    keys(): Array<string>;
    update(key: string, newValue: string, locale?: string): boolean;
}
export {};
