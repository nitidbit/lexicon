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
function isLocaleCode(locale) {
    return lodash_1.default.isString(locale)
        && locale.length < 10;
}
class Lexicon {
    constructor(contentByLocale, localeCode, filename, subset = '') {
        this.currentLocaleCode = localeCode;
        this._filename = filename;
        this._contentByLocale = contentByLocale;
        this._rootKeyPath = subset;
    }
    //
    //    Methods for use by Lexicon clients
    //
    /* Return a new Lexicon with same contents, but different default language code */
    locale(localeCode) {
        if (!isLocaleCode(localeCode))
            throw new Error(`'localeCode' should be e.g. 'en', not: ${localeCode}`);
        if (!util.has(this._contentByLocale, localeCode))
            return null;
        return new Lexicon(this._contentByLocale, localeCode, this._filename, this._rootKeyPath);
    }
    /*
       Return a value from the Lexicon, in the current locale.
       If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
          e.g. "hello #{name}" -> "hello Winston"
    */
    get(keyPath, templateSubstitutions) {
        if (lodash_1.default.isNil(keyPath))
            throw new Error("'keyPath' is null/undefined");
        let info = this.find(this.currentLocaleCode, keyPath);
        //     console.log('!!! get(',keyPath,') info-1=', info);
        if (lodash_1.default.isNil(info)) { // could not find it--try English
            info = this.find(DEFAULT_LOCALE_CODE, keyPath);
            //       console.log('!!! get(',keyPath,') info-2=', info);
            if (lodash_1.default.isNil(info)) { // still couldn't find it--return a clue of the problem
                return `[no content for "${util_1.keyPathAsString(this.fullKey(this.currentLocaleCode, keyPath))}"]`;
            }
        }
        let val = info.value;
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
        let rootPathExcludingLocale = this.fullKey(null, keyPath);
        return new Lexicon(this._contentByLocale, this.currentLocaleCode, this._filename, rootPathExcludingLocale);
    }
    /* Determine the complete "key path" to retrieve our value */
    fullKey(locale, keyPath) {
        var parts = lodash_1.default.compact([locale, util_1.keyPathAsString(this._rootKeyPath), util_1.keyPathAsString(keyPath)]);
        return parts.join('.');
    }
    /* Find some content and return info about that node */
    find(locale, keyPath) {
        if (!isLocaleCode(locale))
            throw new Error(`'locale' should be LocaleCode, e.g. 'en', not: ${locale}`);
        if (lodash_1.default.isNil(keyPath))
            throw new Error("'keyPath' is null/undefined");
        let fullPathExcludingLocale = this.fullKey(null, keyPath);
        return recursiveFind(this, util_1.keyPathAsArray(fullPathExcludingLocale), this, []);
        function recursiveFind(node, keyPath, lexicon, prefix) {
            //       console.log('!!! recursiveFind() prefix=', prefix, 'keyPath=', keyPath, 'node=', node)
            if (lodash_1.default.isNil(node))
                throw new Error("'node' is null/undefined");
            if (lodash_1.default.isNil(keyPath))
                throw new Error("'keyPath' is null/undefined");
            const [firstKey, ...restOfKeys] = keyPath;
            let nextNode = undefined;
            if (node instanceof Lexicon) { // Is this a nested Lexicon?
                lexicon = node;
                prefix = [firstKey]; // Reset prefix to ignore parent Lexicons
                nextNode = util.get(lexicon._contentByLocale, [locale, firstKey]);
            }
            else {
                prefix = prefix.concat([firstKey]); // use concat to not modify old value of 'prefix'
                nextNode = util.get(node, firstKey);
            }
            if (lodash_1.default.isUndefined(nextNode))
                return null; // could not find the node
            if (restOfKeys.length == 0) {
                let result = {
                    lexicon: lexicon,
                    locale: locale,
                    keyPath: prefix,
                    value: nextNode,
                };
                //         console.log('!!! find() value:', nextNode);
                return result;
            }
            ;
            return recursiveFind(nextNode, restOfKeys, lexicon, prefix);
        }
        ;
    }
    //
    //    Methods for use by Lexicon Editor
    //
    /*
       Returns the filename and KeyPath of the item in question.
       The returned keyPath might be different from the input because you're looking
       at a Lexicon subset, with some keys hidden.
     */
    source(keyPath) {
        let info = this.find(this.currentLocaleCode, keyPath);
        return {
            filename: info.lexicon.filename(),
            keyPath: [info.locale].concat(info.keyPath),
        };
    }
    /* Return language codes for available locales */
    locales() {
        return util.keys(this._contentByLocale);
    }
    /* Used by LexiconEditor */
    filename() {
        return this._filename;
    }
    /* Return list of dotted keys, e.g. ['mycomponent.title', 'mycomponent.page1.intro'] */
    keys() {
        const info = this.find(this.currentLocaleCode, []);
        if (lodash_1.default.isNil(info))
            return [];
        const startingNode = info.value;
        console.log('!!! keys() startingNode=', startingNode);
        let flatKeys = [];
        recurse(startingNode, '');
        return flatKeys;
        function recurse(c, prefix) {
            for (const [key, node] of util.entries(c)) {
                if (node instanceof Lexicon) {
                    const subKeys = node.keys();
                    const prefixedKeys = lodash_1.default.map(subKeys, (keyPath) => `${prefix}${key}.${keyPath}`);
                    flatKeys = flatKeys.concat(prefixedKeys);
                }
                else if (util.isCollection(node)) {
                    recurse(node, `${prefix}${key}.`);
                }
                else {
                    flatKeys.push(`${prefix}${key}`);
                }
            }
        }
    }
    /* Set a value in the Lexicon */
    update(keyPath, newValue, locale = this.currentLocaleCode) {
        let fullPath = this.fullKey(locale, keyPath);
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
}
exports.Lexicon = Lexicon;
