import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import isNil from 'lodash/isNil';
import cloneDeepWith from 'lodash/cloneDeepWith';
import lodash_has from 'lodash/has';
import lodash_compact from 'lodash/compact';
import lodash_concat from 'lodash/concat';
import lodash_map from 'lodash/map';
import * as col from './collection';
import { Collection, KeyPath, keyPathAsArray, KeyPathArray, KeyPathString } from './collection';
import {evaluateTemplate } from './util';

export type ContentByLocale = {
  [localeCode: string]: Collection,
};


//
//      LocaleCode & related functions
//
type LocaleCode = string; // e.g. 'en', 'es', 'en_GB', 'zh-Hant'
const DEFAULT_LOCALE_CODE = 'en';

function isLocaleCode(locale:LocaleCode) {
  return isString(locale) && locale.length < 10;
}


//
//      Lexicon — A tree-like container for holding content. Lexicons can hold other Lexicons.
//
export class Lexicon {
  private _contentByLocale: ContentByLocale;
  public currentLocaleCode: LocaleCode;
  private _filename: string;
  private _subsetRoot: KeyPathArray;

  constructor(contentByLocale: ContentByLocale,
              localeCode: LocaleCode,
              filename: string,
              subset: KeyPath = '') {
    if (! lodash_has(contentByLocale, DEFAULT_LOCALE_CODE)) {
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
  locale(localeCode: LocaleCode): Lexicon | null {
    if (! isLocaleCode(localeCode)) throw new Error(`'localeCode' should be e.g. 'en', not: ${localeCode}`);

    if (!col.has(this._contentByLocale, localeCode)) return null;
    return new Lexicon(this._contentByLocale, localeCode, this._filename, this._subsetRoot);
  }

  /* Merge a second 'subLexicon' in under the key 'branchKey'. */
  addBranch(subLexicon: Lexicon, branchKey: string): void {
    for (const locale of Object.keys(this._contentByLocale)) {
      this._contentByLocale[locale][branchKey] = subLexicon.locale(locale);
    }
  }

  /* DEPRECATED. an alias for addBranch() */
  addSubLexicon(subLexicon: Lexicon, branchKey: string) { this.addBranch(subLexicon, branchKey); }

  /*
     Return a value from the Lexicon, in the current locale.
     If you pass 'templateSubsitutions', and the value is a string, then they are inserted into your string or array,
        e.g. "hello #{name}" -> "hello Winston"
        "["hello #{name}"] -> ["hello Winston"]"
  */
  get(keyPath: KeyPath, templateSubstitutions?: object): any {
    if (isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

    let info = this.find(this.currentLocaleCode, keyPath);

    if (isNil(info)) { // could not find it--try English
      info = this.find(DEFAULT_LOCALE_CODE, keyPath);

      if (isNil(info)) { // still couldn't find it--return a clue of the problem
        return `[no content for "${col.keyPathAsString(this.fullKey(this.currentLocaleCode, keyPath))}"]`;
      }
    }

    let val:any = info.value;

    if (isArray(val) && !isUndefined(templateSubstitutions)) {
      val = this.interpolateArray(val, templateSubstitutions);
    } else if (isString(val) && !isUndefined(templateSubstitutions)) {
        val = evaluateTemplate(val as string, templateSubstitutions);
    }

    return val;
  }

  interpolateArray(templateArray: string[], params: object): string[] {
    return templateArray.map(item => evaluateTemplate(item, params));
  }

  /*
   * Gets value, but if the value is not found, return 'undefined'. I.e. don't roll over to default
   * dictionary, or produce informative default value.
   */
  getExact(keyPath: KeyPath): any {
    if (isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

    let info = this.find(this.currentLocaleCode, keyPath);

    if (isNil(info)) {
      return undefined; // could not find value
    }

    return info.value;
  }


  /* Return a new Lexicon, with the "root" starting at a different place.
     E.g.
       a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
       a.subset('secondLevel') // --> Lexicon({title: "Mister"})
  */
  subset(keyPath: KeyPath): Lexicon | null {
    let rootPathExcludingLocale = this.fullKey(null, keyPath);
    return new Lexicon(this._contentByLocale, this.currentLocaleCode, this._filename, rootPathExcludingLocale);
  }


  /* Determine the complete "key path" to retrieve our value */
  private fullKey(locale:LocaleCode, keyPath:KeyPath) {
    var parts = lodash_compact([locale, col.keyPathAsString(this._subsetRoot), col.keyPathAsString(keyPath)]);
    return parts.join('.');
  }


  /* Find some content and return info about that node */
  private find(locale: LocaleCode, keyPath: KeyPath) {
    if (! isLocaleCode(locale)) throw new Error(`'locale' should be LocaleCode, e.g. 'en', not: ${locale}`);
    if (isNil(keyPath)) throw new Error("'keyPath' is null/undefined");

    return recursiveFind(this, col.keyPathAsArray(keyPath), this, [], []);


    function recursiveFind(
        node: Collection | Lexicon,
        keyPath: KeyPathArray,
        lexicon: Lexicon,
        rootPrefix: KeyPathArray,
        localPrefix: KeyPathArray) {
//       console.log('!!! recursiveFind() rootPrefix=', rootPrefix, 'localPrefix=', localPrefix, 'keyPath=', keyPath, 'node=', node)

      if (isUndefined(node)) {
        return null; // could not find the node
      }
      if (isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

      if (keyPath.length == 0 && !(node instanceof Lexicon)) {
        let result = { // Here's the output:
          lexicon: lexicon,     // Which Lexicon contains this node?
          locale: locale,       // The locale we were searching for
          keyPath: localPrefix, // The path from this Lexicon
          updatePath: rootPrefix, // argument for `rootLexicon.update()`
          value: node,          // contents of the node we searched for
        };
        console.debug('find() result=', result)
        return result; // Found it!
      };

      let nextNode = undefined;

      if (node instanceof Lexicon) {
        lexicon = node;
        localPrefix = []
        rootPrefix = rootPrefix.concat(['_contentByLocale', locale])
        keyPath = lodash_concat(col.keyPathAsArray(lexicon._subsetRoot), keyPath);
        nextNode = col.get(lexicon._contentByLocale, [locale]);
      } else {
        const firstKey = keyPath[0];
        keyPath = keyPath.slice(1);
        rootPrefix = rootPrefix.concat([firstKey]); // use concat to not modify old value
        localPrefix = localPrefix.concat([firstKey]);
        nextNode = col.get(node, firstKey);
      }

      return recursiveFind(nextNode, keyPath, lexicon, rootPrefix, localPrefix);
    };
  }

  //
  //    Methods for use by Lexicon Editor
  //

  /*
     Returns the filename and KeyPath of the item in question.
     The returned keyPath might be different from the input because you're looking
     at a Lexicon subset, with some keys hidden.
   */
  source(keyPath: KeyPath) {
    let info = this.find(this.currentLocaleCode, keyPath);
    if (info == null) throw new Error(`Lexicon: Could not find keyPath: '${keyPath}' in file: '${this.filename()}'`);
    return {
      filename: info.lexicon.filename(),
      localPath: [info.locale].concat(info.keyPath),
      updatePath: info.updatePath,
    };
  }


  /* Return language codes for available locales */
  locales(): Array<LocaleCode> {
    return col.keys(this._contentByLocale) as Array<LocaleCode>;
  }


  /* Used by LexiconEditor */
  filename(): string {
    return this._filename;
  }


  /* Return list of dotted keys, e.g. ['mycomponent.title', 'mycomponent.page1.intro'] */
  keys(): Array<KeyPathString> {
    const info = this.find(this.currentLocaleCode, [])
    if (isNil(info)) return [];

    const startingNode = info.value;

    let flatKeys: KeyPathArray = [];
    recurse(startingNode, '');
    return flatKeys;

    function recurse(c: Collection | Lexicon, prefix: string) {
      for (const [key, node] of col.entries(c)) {

        if (node instanceof Lexicon) {
          const subKeys = node.keys();
          const prefixedKeys = lodash_map(subKeys, (keyPath) => `${prefix}${key}.${keyPath}`);
          flatKeys = flatKeys.concat(prefixedKeys);

        } else if (col.isCollection(node)) {
          recurse(node, `${prefix}${key}.`);

        } else {
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
  update(updatePath: KeyPath, newValue: any): boolean {
    if (!col.has(this, updatePath)) return false; // node does not exist

    col.set(this, updatePath, newValue);
    return true; // success
  }


  /* Used by LexiconEditor */
  cloneDeep(): Lexicon {
    function customizer(value) {
      if (value instanceof Lexicon) {
        return value.cloneDeep();
      }
    }
    return new Lexicon(cloneDeepWith(this._contentByLocale, customizer), this.currentLocaleCode, this._filename, this._subsetRoot);
  }

  clone(): Lexicon {
    console.warn('Lexicon.ts: clone() is deprecated. Use cloneDeep() instead.');
    return this.cloneDeep();
  }
}
