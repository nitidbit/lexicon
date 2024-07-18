"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexicon = void 0;
const isString_1 = __importDefault(require("lodash/isString"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const isUndefined_1 = __importDefault(require("lodash/isUndefined"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const cloneDeepWith_1 = __importDefault(require("lodash/cloneDeepWith"));
const has_1 = __importDefault(require("lodash/has"));
const compact_1 = __importDefault(require("lodash/compact"));
const concat_1 = __importDefault(require("lodash/concat"));
const map_1 = __importDefault(require("lodash/map"));
const col = __importStar(require("./collection"));
const util_1 = require("./util");
const DEFAULT_LOCALE_CODE = 'en';
function isLocaleCode(locale) {
    return (0, isString_1.default)(locale) && locale.length < 10;
}
//
//      Lexicon — A tree-like container for holding content. Lexicons can hold other Lexicons.
//
class Lexicon {
    constructor(contentByLocale, localeCode, filename, subset = '') {
        if (!(0, has_1.default)(contentByLocale, DEFAULT_LOCALE_CODE)) {
            throw new Error("'contentByLocale' must contain 'en: {...}' locale");
        }
        this.currentLocaleCode = localeCode;
        this._filename = filename;
        this._contentByLocale = contentByLocale;
        this._subsetRoot = col.keyPathAsArray(subset);
    }
    //
    //    Methods for use by Lexicon clients
    //
    /* Return a new Lexicon with same contents, but different default language code */
    locale(localeCode) {
        if (!isLocaleCode(localeCode))
            throw new Error(`'localeCode' should be e.g. 'en', not: ${localeCode}`);
        if (!col.has(this._contentByLocale, localeCode))
            return null;
        return new Lexicon(this._contentByLocale, localeCode, this._filename, this._subsetRoot);
    }
    /* Merge a second 'subLexicon' in under the key 'branchKey'. */
    addBranch(subLexicon, branchKey) {
        for (const locale of Object.keys(this._contentByLocale)) {
            this._contentByLocale[locale][branchKey] = subLexicon.locale(locale);
        }
    }
    /* DEPRECATED. an alias for addBranch() */
    addSubLexicon(subLexicon, branchKey) { this.addBranch(subLexicon, branchKey); }
    /*
       Return a value from the Lexicon, in the current locale.
       If you pass 'templateSubsitutions', and the value is a string, then they are inserted into your string or array,
          e.g. "hello #{name}" -> "hello Winston"
          "["hello #{name}"] -> ["hello Winston"]"
    */
    get(keyPath, templateSubstitutions) {
        if ((0, isNil_1.default)(keyPath))
            throw new Error("'keyPath' is null/undefined");
        let info = this.find(this.currentLocaleCode, keyPath);
        if ((0, isNil_1.default)(info)) { // could not find it--try English
            info = this.find(DEFAULT_LOCALE_CODE, keyPath);
            if ((0, isNil_1.default)(info)) { // still couldn't find it--return a clue of the problem
                return `[no content for "${col.keyPathAsString(this.fullKey(this.currentLocaleCode, keyPath))}"]`;
            }
        }
        let val = info.value;
        if ((0, isArray_1.default)(val) && !(0, isUndefined_1.default)(templateSubstitutions)) {
            val = this.interpolateArray(val, templateSubstitutions);
        }
        else if ((0, isString_1.default)(val) && !(0, isUndefined_1.default)(templateSubstitutions)) {
            val = (0, util_1.evaluateTemplate)(val, templateSubstitutions);
        }
        return val;
    }
    interpolateArray(templateArray, params) {
        return templateArray.map(item => (0, util_1.evaluateTemplate)(item, params));
    }
    /*
     * Gets value, but if the value is not found, return 'undefined'. I.e. don't roll over to default
     * dictionary, or produce informative default value.
     */
    getExact(keyPath) {
        if ((0, isNil_1.default)(keyPath))
            throw new Error("'keyPath' is null/undefined");
        let info = this.find(this.currentLocaleCode, keyPath);
        if ((0, isNil_1.default)(info)) {
            return undefined; // could not find value
        }
        return info.value;
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
        var parts = (0, compact_1.default)([locale, col.keyPathAsString(this._subsetRoot), col.keyPathAsString(keyPath)]);
        return parts.join('.');
    }
    /* Find some content and return info about that node */
    find(locale, keyPath) {
        if (!isLocaleCode(locale))
            throw new Error(`'locale' should be LocaleCode, e.g. 'en', not: ${locale}`);
        if ((0, isNil_1.default)(keyPath))
            throw new Error("'keyPath' is null/undefined");
        return recursiveFind(this, col.keyPathAsArray(keyPath), this, [], []);
        function recursiveFind(node, keyPath, lexicon, rootPrefix, localPrefix) {
            //       console.log('!!! recursiveFind() rootPrefix=', rootPrefix, 'localPrefix=', localPrefix, 'keyPath=', keyPath, 'node=', node)
            if ((0, isUndefined_1.default)(node)) {
                return null; // could not find the node
            }
            if ((0, isNil_1.default)(keyPath))
                throw new Error("'keyPath' is null/undefined");
            if (keyPath.length == 0 && !(node instanceof Lexicon)) {
                let result = {
                    lexicon: lexicon, // Which Lexicon contains this node?
                    locale: locale, // The locale we were searching for
                    keyPath: localPrefix, // The path from this Lexicon
                    updatePath: rootPrefix, // argument for `rootLexicon.update()`
                    value: node, // contents of the node we searched for
                };
                return result; // Found it!
            }
            ;
            let nextNode = undefined;
            if (node instanceof Lexicon) {
                lexicon = node;
                localPrefix = [];
                rootPrefix = rootPrefix.concat(['_contentByLocale', locale]);
                keyPath = (0, concat_1.default)(col.keyPathAsArray(lexicon._subsetRoot), keyPath);
                nextNode = col.get(lexicon._contentByLocale, [locale]);
            }
            else {
                const firstKey = keyPath[0];
                keyPath = keyPath.slice(1);
                rootPrefix = rootPrefix.concat([firstKey]); // use concat to not modify old value
                localPrefix = localPrefix.concat([firstKey]);
                nextNode = col.get(node, firstKey);
            }
            return recursiveFind(nextNode, keyPath, lexicon, rootPrefix, localPrefix);
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
        if (info == null)
            throw new Error(`Lexicon: Could not find keyPath: '${keyPath}' in file: '${this.filename()}'`);
        return {
            filename: info.lexicon.filename(),
            localPath: [info.locale].concat(info.keyPath),
            updatePath: info.updatePath,
        };
    }
    /* Return language codes for available locales */
    locales() {
        return col.keys(this._contentByLocale);
    }
    /* Used by LexiconEditor */
    filename() {
        return this._filename;
    }
    /* Return list of dotted keys, e.g. ['mycomponent.title', 'mycomponent.page1.intro'] */
    keys() {
        const info = this.find(this.currentLocaleCode, []);
        if ((0, isNil_1.default)(info))
            return [];
        const startingNode = info.value;
        let flatKeys = [];
        recurse(startingNode, '');
        return flatKeys;
        function recurse(c, prefix) {
            for (const [key, node] of col.entries(c)) {
                if (node instanceof Lexicon) {
                    const subKeys = node.keys();
                    const prefixedKeys = (0, map_1.default)(subKeys, (keyPath) => `${prefix}${key}.${keyPath}`);
                    flatKeys = flatKeys.concat(prefixedKeys);
                }
                else if (col.isCollection(node)) {
                    recurse(node, `${prefix}${key}.`);
                }
                else {
                    flatKeys.push(`${prefix}${key}`);
                }
            }
        }
    }
    /*
     * Change value in a lexicon.
     * Note that updatePath is interepreted from the root of this Lexicon, and ignores current
     * locale and subset settings
     */
    update(updatePath, newValue) {
        if (!col.has(this, updatePath))
            return false; // node does not exist
        col.set(this, updatePath, newValue);
        return true; // success
    }
    /* Used by LexiconEditor */
    cloneDeep() {
        function customizer(value) {
            if (value instanceof Lexicon) {
                return value.cloneDeep();
            }
        }
        return new Lexicon((0, cloneDeepWith_1.default)(this._contentByLocale, customizer), this.currentLocaleCode, this._filename, this._subsetRoot);
    }
    clone() {
        console.warn('Lexicon.ts: clone() is deprecated. Use cloneDeep() instead.');
        return this.cloneDeep();
    }
}
exports.Lexicon = Lexicon;