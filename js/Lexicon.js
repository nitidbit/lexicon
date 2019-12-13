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
// const convertRawLexiconObjectToMap = (obj: RawLexiconObject): RawLexiconMap => {
//   const lex: RawLexiconMap = new Map();
//   for (const k in obj) {
//     const val = obj[k];
//     if (_.isString(val)
//       || _.isNull(val)
//       || _.isNumber(val)
//       || _.isBoolean(val)
//       || _.isArray(val)
//     ) {
//       lex.set(k, val);
// //     } else if (val instanceof Array) {
// // //       const obj = val.reduce((acc, v, i) => ({ ...acc, [i]: v }), {});
// // //       lex.set(k, convertRawLexiconObjectToMap(obj));
// //       lex.set(k, val);
//     } else {
//       lex.set(k, convertRawLexiconObjectToMap(val as {string:any}));
//     }
//   }
//   return lex;
// };
// const convertRawLexiconMapToObject = (map: RawLexiconMap): RawLexiconObject => {
//   const obj: RawLexiconObject = {};
//   const convertValue = (val: string | RawLexiconMap): string | Array<RawLexiconObject> | RawLexiconObject => {
// console.log('!!! convertRaw..ToObject val=', val);
//     if (_.isString(val)) {
//       return val;
//     } else {
//       const numericKeys = [...val.keys()].every(k => k.match(/^\d+$/) != null);
//       const consecutiveKeys = numericKeys && (
//           [...val.keys()]
//             .map(k => parseInt(k))
//             .sort((a, b) => a - b)
//             .every((n, i, a) => i == 0 ? true : (n - a[i - 1] == 1))
//         );
//       if (numericKeys && consecutiveKeys) {
//         // array!
//         const arr: Array<RawLexiconObject> = new Array(val.size);
//         for (const [k, v] of val) {
//           arr[parseInt(k)] = convertValue(v) as RawLexiconObject;
//         }
//         return arr;
//       } else {
//         // object!
//         const obj: RawLexiconObject = {};
//         for (const [k, v] of val) {
//           obj[k] = convertValue(v);
//         }
//         return obj;
//       }
//     }
//   };
//   for (const [k, v] of map) {
//     obj[k] = convertValue(v);
//   }
//   return obj;
// }
class Lexicon {
    constructor(_locales, localeCode, filename) {
        this.currentLocaleCode = localeCode;
        this._filename = filename;
        this._contentByLocale = _locales;
        //     if (_.isMap(_locales)) {
        //       this._contentByLocale = _locales;
        //     } else {
        //       this._contentByLocale = new Map();
        //       for (let lang in _locales) {
        //         this._contentByLocale.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
        //       }
        //     }
    }
    // Return a new Lexicon with same contens, but different default language code
    locale(languageCode) {
        if (!util.has(this._contentByLocale, languageCode))
            return null;
        return new Lexicon(this._contentByLocale, languageCode, this._filename);
    }
    // Return language codes for available locales
    locales() {
        return util.keys(this._contentByLocale);
    }
    filename() {
        return this._filename;
    }
    // Return a value from the Lexicon, in the current locale.
    // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
    //    e.g. "hello #{name}" -> "hello Winston"
    get(key, templateSubstitutions) {
        const localizedContent = util.get(this._contentByLocale, this.currentLocaleCode);
        let val = util.get(localizedContent, key);
        if (lodash_1.default.isUndefined(val)) { // could not find data--try English
            const defaultContent = util.get(this._contentByLocale, DEFAULT_LOCALE_CODE);
            val = util.get(defaultContent, key);
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
        let newLocales = {};
        // copy sub content for each language
        for (const [langKey, localizedContent] of util.entries(this._contentByLocale)) {
            const subContent = util.get(localizedContent, nestedKey);
            util.set(newLocales, langKey, subContent);
        }
        return new Lexicon(newLocales, this.currentLocaleCode, this._filename);
    }
    keys() {
        const localeMap = util.get(this._contentByLocale, this.currentLocaleCode);
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
        if (!util.has(this._contentByLocale, locale))
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
            const localeMap = util.get(this._contentByLocale, locale);
            if (!util.has(localeMap, key)) {
                return false;
            }
            else {
                util.set(localeMap, key, newValue);
                return true;
            }
        }
    }
    clone() {
        //     const newMap = new Map(this._contentByLocale);
        //     for (const [lang, lexicon] of newMap) {
        //       newMap.set(lang, cloneNestedMap(lexicon));
        //     }
        return new Lexicon(util.clone(this._contentByLocale), this.currentLocaleCode, this._filename);
    }
    asObject() {
        return this._contentByLocale;
        //     const obj: LocalesObject = {};
        //     for (const [lang, locale] of this._contentByLocale) {
        //       obj[lang] = convertRawLexiconMapToObject(locale);
        //     }
        //     return obj;
    }
}
exports.Lexicon = Lexicon;
