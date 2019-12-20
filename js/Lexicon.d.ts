import { KeyPath } from './util';
declare type LocaleCode = string;
export declare type ContentByLocale = {
    [lang: string]: object | Map<any, any>;
};
export declare class Lexicon {
    private _contentByLocale;
    currentLocaleCode: LocaleCode;
    private _filename;
    private _rootKeyPath;
    constructor(contentByLocale: ContentByLocale, localeCode: LocaleCode, filename: string, subset?: KeyPath);
    locale(localeCode: LocaleCode): Lexicon | null;
    locales(): Array<LocaleCode>;
    filename(): string;
    get(key: KeyPath, templateSubstitutions?: object): string | null;
    private _fullKey;
    subset(keyPath: KeyPath): Lexicon | null;
    source(keyPath: KeyPath): {
        filename: string;
        keyPath: KeyPath;
    };
    keys(): Array<string>;
    update(key: string, newValue: any, localeCode?: LocaleCode): boolean;
    clone(): Lexicon;
    asObject(): ContentByLocale;
}
export {};
