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
    private _fullKey;
    source(keyPath: KeyPath): {
        filename: string;
        keyPath: KeyPath;
    };
    locales(): Array<LocaleCode>;
    filename(): string;
    keys(): Array<string>;
    update(key: string, newValue: any, localeCode?: LocaleCode): boolean;
    clone(): Lexicon;
    asObject(): ContentByLocale;
}
export {};
