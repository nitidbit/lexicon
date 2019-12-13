"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const util = __importStar(require("./util"));
const lodash_1 = __importDefault(require("lodash"));
const DEFAULT_LOCALE_CODE = 'en';
const convertRawLexiconObjectToMap = (obj) => {
    const lex = new Map();
    for (const k in obj) {
        const val = obj[k];
        if (lodash_1.default.isString(val)
            || lodash_1.default.isNull(val)
            || lodash_1.default.isNumber(val)
            || lodash_1.default.isBoolean(val)
            || lodash_1.default.isArray(val)) {
            lex.set(k, val);
            //     } else if (val instanceof Array) {
            // //       const obj = val.reduce((acc, v, i) => ({ ...acc, [i]: v }), {});
            // //       lex.set(k, convertRawLexiconObjectToMap(obj));
            //       lex.set(k, val);
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
        if (lodash_1.default.isString(val)) {
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
    constructor(_locales, localeCode, filename) {
        this.currentLocaleCode = localeCode;
        this._filename = filename;
        if (lodash_1.default.isMap(_locales)) {
            this._contentByLocale = _locales;
        }
        else {
            this._contentByLocale = new Map();
            for (let lang in _locales) {
                this._contentByLocale.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
            }
        }
    }
    // Return a new Lexicon with same contens, but different default language code
    locale(languageCode) {
        if (!this._contentByLocale.has(languageCode))
            return null;
        return new Lexicon(this._contentByLocale, languageCode, this._filename);
    }
    // Return language codes for available locales
    locales() {
        return [...this._contentByLocale.keys()];
    }
    filename() {
        return this._filename;
    }
    // Return a value from the Lexicon, in the current locale.
    // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
    //    e.g. "hello #{name}" -> "hello Winston"
    get(key, templateSubstitutions) {
        const localizedContent = this._contentByLocale.get(this.currentLocaleCode);
        let val = getNested(localizedContent, key);
        if (lodash_1.default.isUndefined(val)) { // could not find data--try English
            const defaultContent = this._contentByLocale.get(DEFAULT_LOCALE_CODE);
            val = getNested(defaultContent, key);
            if (lodash_1.default.isUndefined(val)) { // still couldn't find it--return a clue of the problem
                return `[no content for "${key}"]`;
            }
        }
        if (lodash_1.default.isString(val) && !lodash_1.default.isUndefined(templateSubstitutions)) {
            val = util_1.evaluateTemplate(val, templateSubstitutions);
        }
        return val;
    }
    // Return a new Lexicon, with the "root" starting at a different place.
    // E.g.
    //   a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
    //   a.subset('secondLevel') // --> Lexicon({title: "Mister"})
    subset(nestedKey) {
        const newLocales = new Map();
        for (const [localeKey, localeMap] of this._contentByLocale) {
            const sub = getNested(localeMap, nestedKey);
            if (lodash_1.default.isMap(sub)) {
                newLocales.set(localeKey, sub);
            }
        }
        if (newLocales.size === 0)
            return null;
        return new Lexicon(newLocales, this.currentLocaleCode, this._filename);
    }
    keys() {
        const localeMap = this._contentByLocale.get(this.currentLocaleCode);
        if (localeMap === undefined)
            return [];
        const flatKeys = [];
        const recurse = (c, prefix) => {
            for (const [k, v] of util.entries(c)) {
                if (util.isCollection(v)) {
                    recurse(v, `${prefix}${k}.`);
                }
                else {
                    flatKeys.push(`${prefix}${k}`);
                }
            }
        };
        recurse(localeMap, '');
        return flatKeys;
    }
    update(key, newValue, locale = this.currentLocaleCode) {
        if (!this._contentByLocale.has(locale))
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
            const localeMap = this._contentByLocale.get(locale);
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
        const newMap = new Map(this._contentByLocale);
        for (const [lang, lexicon] of newMap) {
            newMap.set(lang, util_1.cloneNestedMap(lexicon));
        }
        return new Lexicon(newMap, this.currentLocaleCode, this._filename);
    }
    asObject() {
        const obj = {};
        for (const [lang, locale] of this._contentByLocale) {
            obj[lang] = convertRawLexiconMapToObject(locale);
        }
        return obj;
    }
}
exports.Lexicon = Lexicon;
function getFromCollection(collection, key) {
    if (lodash_1.default.isMap(collection))
        return collection.get(key);
    return collection[key];
}
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function getNested(data, nestedKey) {
    if (lodash_1.default.isNull(nestedKey) || lodash_1.default.isUndefined(nestedKey))
        throw new Error("'nestedKey' is null/undefined");
    if (lodash_1.default.isNull(data) || lodash_1.default.isUndefined(data))
        throw new Error("'data' is null/undefined");
    if (!util.isCollection(data)) {
        return undefined; // content not found
    }
    if (lodash_1.default.isString(nestedKey)) {
        nestedKey = nestedKey.split('.');
    }
    const [firstKey, ...rest] = nestedKey;
    const subData = getFromCollection(data, firstKey);
    if (rest.length == 0) {
        return subData; // we found it
    }
    return getNested(subData, rest.join('.'));
}
