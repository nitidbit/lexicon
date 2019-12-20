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
class Lexicon {
    constructor(contentByLocale, localeCode, filename, subset = '') {
        this.currentLocaleCode = localeCode;
        this._filename = filename;
        this._contentByLocale = contentByLocale;
        this._rootKeyPath = subset;
    }
    // Return a new Lexicon with same contens, but different default language code
    locale(localeCode) {
        if (!util.has(this._contentByLocale, localeCode))
            return null;
        return new Lexicon(this._contentByLocale, localeCode, this._filename, this._rootKeyPath);
    }
    // Return language codes for available locales
    locales() {
        return util.keys(this._contentByLocale);
    }
    filename() {
        return this._filename;
    }
    /*
       Return a value from the Lexicon, in the current locale.
       If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
          e.g. "hello #{name}" -> "hello Winston"
    */
    get(key, templateSubstitutions) {
        let fullKey = this._fullKey(this.currentLocaleCode, key);
        let val = util.get(this._contentByLocale, fullKey);
        if (lodash_1.default.isUndefined(val)) { // could not find data--try English
            val = util.get(this._contentByLocale, this._fullKey(DEFAULT_LOCALE_CODE, key));
            if (lodash_1.default.isUndefined(val)) { // still couldn't find it--return a clue of the problem
                return `[no content for "${fullKey}"]`;
            }
        }
        if (lodash_1.default.isString(val) && !lodash_1.default.isUndefined(templateSubstitutions)) {
            val = util_1.evaluateTemplate(val, templateSubstitutions);
        }
        return val;
    }
    _fullKey(localeCode, nestedKey) {
        var parts = lodash_1.default.compact([localeCode, this._rootKeyPath, nestedKey]);
        return parts.join('.');
    }
    /* Return a new Lexicon, with the "root" starting at a different place.
       E.g.
         a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
         a.subset('secondLevel') // --> Lexicon({title: "Mister"})
    */
    subset(nestedKey) {
        let rootPathExcludingLocale = this._fullKey(null, nestedKey);
        return new Lexicon(this._contentByLocale, this.currentLocaleCode, this._filename, rootPathExcludingLocale);
    }
    /*
       Returns the filename and NestedKey of the item in question.
       The returned nestedKey might be different from the input because you're looking
       at a Lexicon subset, with some keys hidden.
     */
    source(nestedKey) {
        return {
            filename: this.filename(),
            nestedKey: this._fullKey(this.currentLocaleCode, nestedKey),
        };
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
    update(key, newValue, localeCode = this.currentLocaleCode) {
        let fullPath = this._fullKey(localeCode, key);
        if (!util.has(this._contentByLocale, fullPath)) {
            return false; // We don't have that locale
        }
        util.set(this._contentByLocale, fullPath, newValue);
        return true; // success
        // console.log('  update() key=', key, 'newValue=', newValue, 'locale=', locale);
        //     if (!util.has(this._contentByLocale, locale)) return false; // We don't have that locale
        //     if (key.includes('.')) {
        //       const firstPath = key.substr(0, key.lastIndexOf('.')),
        //         tailKey = key.substr(key.lastIndexOf('.') + 1),
        //         subset = this.locale(locale).subset(firstPath);
        //       if (subset === null) {
        //         return false; // Don't have that branch of content
        //       } else {
        //         return subset.update(tailKey, newValue, locale);
        //       }
        //     } else {
        //       const localeMap = util.get(this._contentByLocale, locale);
        // console.log('    util.has(localeMap, key)=', util.has(localeMap, key));
        //       if (! util.has(localeMap, key)) {
        //         return false; // Don't have that branch of content
        //       } else {
        //         util.set(localeMap, key, newValue);
        //         return true;
        //       }
        //     }
    }
    clone() {
        return new Lexicon(lodash_1.default.cloneDeep(this._contentByLocale), this.currentLocaleCode, this._filename, this._rootKeyPath);
    }
    asObject() {
        return this._contentByLocale;
    }
}
exports.Lexicon = Lexicon;
