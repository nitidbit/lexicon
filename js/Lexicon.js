"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const convertRawLexiconObjectToMap = (obj) => {
    const lex = new Map();
    for (const k in obj) {
        const val = obj[k];
        if (typeof val == 'string') {
            lex.set(k, val);
        }
        else if (val instanceof Array) {
            const obj = val.reduce((acc, v, i) => (Object.assign({}, acc, { [i]: v })), {});
            lex.set(k, convertRawLexiconObjectToMap(obj));
        }
        else {
            lex.set(k, convertRawLexiconObjectToMap(val));
        }
    }
    return lex;
};
const convertRawLexiconMapToObject = (map) => {
    const obj = {};
    const convertValue = (val) => {
        if (typeof val == 'string') {
            return val;
        }
        else {
            const numericKeys = [...val.keys()].every(k => k.match(/^\d+$/) != null);
            const consecutiveKeys = numericKeys && ([...val.keys()]
                .map(k => parseInt(k))
                .sort((a, b) => a - b)
                .every((n, i, a) => i == 0 ? true : (n - a[i - 1] == 1)));
            if (numericKeys && consecutiveKeys) {
                // array!
                const arr = new Array(val.size);
                for (const [k, v] of val) {
                    arr[parseInt(k)] = convertValue(v);
                }
                return arr;
            }
            else {
                // object!
                const obj = {};
                for (const [k, v] of val) {
                    obj[k] = convertValue(v);
                }
                return obj;
            }
        }
    };
    for (const [k, v] of map) {
        obj[k] = convertValue(v);
    }
    return obj;
};
class Lexicon {
    constructor(_locales, defaultLocale, filename) {
        this.defaultLocale = defaultLocale;
        this._filename = filename;
        if (_locales instanceof Map) {
            this._locales = _locales;
        }
        else {
            this._locales = new Map();
            for (let lang in _locales) {
                this._locales.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
            }
        }
    }
    // Return a new Lexicon with same contens, but different default language code
    locale(languageCode) {
        if (!this._locales.has(languageCode))
            return null;
        return new Lexicon(this._locales, languageCode, this._filename);
    }
    // Return language codes for available locales
    locales() {
        return [...this._locales.keys()];
    }
    filename() {
        return this._filename;
    }
    // Return a value from the Lexicon, in the current locale.
    // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
    //    e.g. "hello #{name}" -> "hello Winston"
    get(key, templateSubstitutions) {
        const locale = this._locales.get(this.defaultLocale);
        const val = util_1.getNestedKeyInMap(locale, key);
        if (val instanceof Map) {
            return null;
        }
        else {
            if (templateSubstitutions !== undefined) {
                return util_1.evaluateTemplate(val, templateSubstitutions);
            }
            else {
                return val;
            }
        }
    }
    // Return a new Lexicon, with the "root" starting at a different place.
    // E.g.
    //   a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
    //   a.subset('secondLevel') // --> Lexicon({title: "Mister"})
    subset(path) {
        const newLocales = new Map();
        for (const [localeKey, localeMap] of this._locales) {
            const sub = util_1.getNestedKeyInMap(localeMap, path);
            if (sub instanceof Map) {
                newLocales.set(localeKey, sub);
            }
        }
        if (newLocales.size === 0)
            return null;
        return new Lexicon(newLocales, this.defaultLocale, this._filename);
    }
    keys() {
        const localeMap = this._locales.get(this.defaultLocale);
        if (localeMap === undefined)
            return [];
        return util_1.flattenMap(localeMap);
    }
    update(key, newValue, locale = this.defaultLocale) {
        if (!this._locales.has(locale))
            return false;
        if (key.includes('.')) {
            const firstPath = key.substr(0, key.lastIndexOf('.')), tailKey = key.substr(key.lastIndexOf('.') + 1), subset = this.locale(locale).subset(firstPath);
            if (subset === null) {
                return false;
            }
            else {
                return subset.update(tailKey, newValue, locale);
            }
        }
        else {
            const localeMap = this._locales.get(locale);
            if (!localeMap.has(key)) {
                return false;
            }
            else {
                localeMap.set(key, newValue);
                return true;
            }
        }
    }
    clone() {
        const newMap = new Map(this._locales);
        for (const [lang, lexicon] of newMap) {
            newMap.set(lang, util_1.cloneNestedMap(lexicon));
        }
        return new Lexicon(newMap, this.defaultLocale, this._filename);
    }
    asObject() {
        const obj = {};
        for (const [lang, locale] of this._locales) {
            obj[lang] = convertRawLexiconMapToObject(locale);
        }
        return obj;
    }
}
exports.Lexicon = Lexicon;
