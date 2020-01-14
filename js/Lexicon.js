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
    /* Identifies which (possibly nested) Lexicon actually contains 'keyPath'
     */
    //   info(keyPath: KeyPath): {lexicon:Lexicon, subPath:KeyPath} | null {
    //     function recursiveFind(data: Collection | Lexicon, keyPath: Array<string>): any {
    //       if (_.isNil(data)) throw new Error("'data' is null/undefined")
    //       if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined")
    //       const [firstKey, ...restOfKeys] = keyPath;
    //       let subData = undefined;
    //       if (data instanceof Lexicon) {
    //         subData = data.get(firstKey);
    //       } else {
    //         subData = util.get(data, firstKey);
    //       }
    //       if (restOfKeys.length == 0) {
    //         return subData; // we found it
    //       }
    //       return recursiveGet(subData, restOfKeys);
    //     }
    //   }
    /*
       Return a value from the Lexicon, in the current locale.
       If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
          e.g. "hello #{name}" -> "hello Winston"
    */
    get(keyPath, templateSubstitutions) {
        if (lodash_1.default.isNil(keyPath))
            throw new Error("'keyPath' is null/undefined");
        if (lodash_1.default.isNil(this._contentByLocale))
            throw new Error("'this._contentByLocale' is null/undefined");
        // Get one level
        function recursiveGet(data, keyPath) {
            if (lodash_1.default.isNil(data))
                throw new Error("'data' is null/undefined");
            if (lodash_1.default.isNil(keyPath))
                throw new Error("'keyPath' is null/undefined");
            const [firstKey, ...restOfKeys] = keyPath;
            let subData = undefined;
            if (data instanceof Lexicon) {
                subData = data.get(firstKey);
            }
            else {
                subData = util.get(data, firstKey);
            }
            if (restOfKeys.length == 0) {
                return subData; // we found it
            }
            return recursiveGet(subData, restOfKeys);
        }
        let fullKey = util_1.keyPathAsArray(this._fullKey(this.currentLocaleCode, keyPath));
        let val = recursiveGet(this._contentByLocale, fullKey);
        if (lodash_1.default.isUndefined(val)) { // could not find data--try English
            val = util.get(this._contentByLocale, this._fullKey(DEFAULT_LOCALE_CODE, keyPath));
            if (lodash_1.default.isUndefined(val)) { // still couldn't find it--return a clue of the problem
                return `[no content for "${util_1.keyPathAsString(fullKey)}"]`;
            }
        }
        if (lodash_1.default.isString(val) && !lodash_1.default.isUndefined(templateSubstitutions)) {
            val = util_1.evaluateTemplate(val, templateSubstitutions);
        }
        return val;
    }
    /* Return a new Lexicon, with the "root" starting at a different place.
       E.g.
         a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
         a.subset('secondLevel') // --> Lexicon({title: "Mister"})
    */
    subset(keyPath) {
        let rootPathExcludingLocale = this._fullKey(null, keyPath);
        return new Lexicon(this._contentByLocale, this.currentLocaleCode, this._filename, rootPathExcludingLocale);
    }
    /* Determine the complete "key path" to retrieve our value */
    _fullKey(localeCode, keyPath) {
        var parts = lodash_1.default.compact([localeCode, util_1.keyPathAsString(this._rootKeyPath), util_1.keyPathAsString(keyPath)]);
        return parts.join('.');
    }
    /* Used by LexiconEditor
  
       Returns the filename and KeyPath of the item in question.
       The returned keyPath might be different from the input because you're looking
       at a Lexicon subset, with some keys hidden.
     */
    source(keyPath) {
        return {
            filename: this.filename(),
            keyPath: this._fullKey(this.currentLocaleCode, keyPath),
        };
    }
    /* Used by LexiconEditor
       Return language codes for available locales
     */
    locales() {
        return util.keys(this._contentByLocale);
    }
    /* Used by LexiconEditor */
    filename() {
        return this._filename;
    }
    /* Used by LexiconEditor */
    keys() {
        const localeMap = util.get(this._contentByLocale, this.currentLocaleCode);
        if (localeMap === undefined)
            return [];
        let flatKeys = [];
        const recurse = (c, prefix) => {
            for (const [k, v] of util.entries(c)) {
                if (v instanceof Lexicon) {
                    const subKeys = v.keys();
                    const prefixedKeys = lodash_1.default.map(subKeys, (keyPath) => `${prefix}${k}.${keyPath}`);
                    console.log('!!! keys() prefixedKeys=', prefixedKeys);
                    flatKeys = flatKeys.concat(prefixedKeys);
                }
                else if (util.isCollection(v)) {
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
    /* Used by LexiconEditor */
    update(key, newValue, localeCode = this.currentLocaleCode) {
        let fullPath = this._fullKey(localeCode, key);
        if (!util.has(this._contentByLocale, fullPath)) {
            return false; // We don't have that locale
        }
        util.set(this._contentByLocale, fullPath, newValue);
        return true; // success
    }
    /* Used by LexiconEditor */
    clone() {
        return new Lexicon(lodash_1.default.cloneDeep(this._contentByLocale), this.currentLocaleCode, this._filename, this._rootKeyPath);
    }
    /* Used by LexiconEditor */
    asObject() {
        return this._contentByLocale;
    }
}
exports.Lexicon = Lexicon;
