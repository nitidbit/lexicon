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
class Lexicon {
    constructor(_locales, defaultLocale) {
        this.defaultLocale = defaultLocale;
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
    locale(locale) {
        if (!this._locales.has(locale))
            return null;
        return new Lexicon(this._locales, locale);
    }
    locales() {
        return [...this._locales.keys()];
    }
    get(key, data) {
        const locale = this._locales.get(this.defaultLocale);
        const val = util_1.getNestedKeyInMap(locale, key);
        if (val instanceof Map) {
            return null;
        }
        else {
            if (data !== undefined) {
                return util_1.evaluateTemplate(val, data);
            }
            else {
                return val;
            }
        }
    }
    subset(path) {
        const newLocales = new Map();
        for (const [localeKey, localeMap] of this._locales.entries()) {
            const sub = util_1.getNestedKeyInMap(localeMap, path);
            if (sub instanceof Map) {
                newLocales.set(localeKey, sub);
            }
        }
        if (newLocales.size === 0)
            return null;
        return new Lexicon(newLocales, this.defaultLocale);
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
        return new Lexicon(newMap, this.defaultLocale);
    }
}
exports.Lexicon = Lexicon;
