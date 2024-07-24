import lodash_fp from 'lodash/fp'
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import isNil from 'lodash/isNil';
import lodash_concat from 'lodash/concat';
import lodash_map from 'lodash/map';
import lodash_get from 'lodash/get';
import * as col from './collection';
import { Collection, KeyPath, keyPathAsArray, KeyPathArray, KeyPathString } from './collection';
import {evaluateTemplate } from './util';

export type ContentByLocale = {
  repoPath?: string;
  [localeCode: string]: Collection | string | undefined;
};

//
//      LocaleCode & related functions
//
export type LocaleCode = string; // e.g. 'en', 'es', 'en_GB', 'zh-Hant'
export const DEFAULT_LOCALE_CODE = 'en';

function isLocaleCode(locale:LocaleCode) {
  return isString(locale) && locale.length < 10;
}

// return the constructor for an instance of a JS class
// from https://stackoverflow.com/questions/62010217/how-to-create-a-new-object-of-same-class-as-current-object-from-within-a-method
const classConstructor = (someInstance) => {
  return(someInstance.constructor[Symbol.species] ?? someInstance.constructor)
}

//
//      Lexicon — A tree-like container for holding content. Lexicons can hold other Lexicons.
//

export class Lexicon {
  public currentLocaleCode: LocaleCode;
  protected _data: ContentByLocale;
  protected _subsetRoot: KeyPathArray;
  protected _filename: string;

  constructor(contentByLocale: ContentByLocale,
              localeCode: LocaleCode = DEFAULT_LOCALE_CODE,
              subset: KeyPath = '') {
    // extract repoPath without causing TypeScript errors
    const contentWithPath = contentByLocale as ContentByLocale & { repoPath: string };
    if (isUndefined(contentWithPath.repoPath)) {
      throw new Error(`'contentByLocale' must contain 'repoPath: 'path/to/content.json'. \ncontentByLocale=\n>>>${JSON.stringify(contentWithPath)}<<<`);
    }
    this._filename = contentWithPath.repoPath;

    // ensure content at least has 'en' locale
    if (! lodash_fp.has(DEFAULT_LOCALE_CODE, contentByLocale)) {
      throw new Error("'contentByLocale' must contain 'en: {...}' locale");
    }
    this.currentLocaleCode = localeCode;
    // delete contentByLocale["repoPath"]
    this._data = contentByLocale;
    this._subsetRoot = col.keyPathAsArray(subset);
  }

  //
  //    Methods for use by Lexicon clients
  //

  /* Return a new Lexicon with same contents, but different default language code */
  locale(localeCode: LocaleCode): Lexicon | null {
    if (! isLocaleCode(localeCode)) throw new Error(`'localeCode' should be e.g. 'en', not: ${localeCode}`);

    if (!lodash_fp.has(localeCode, this._data)) return null;

    return new (classConstructor(this))(this._data, localeCode, this._subsetRoot)
  }

  /*
     Return a value from the Lexicon, in the current locale.
     If you pass 'templateSubsitutions', and the value is a string or array, then they are inserted,
        e.g.
        // where mykey: "hello #{name}"
        l.get("mykey", {name: "Winston"}) // -> "hello Winston"

        // where mykey: ["Mr #{name}", "Mrs #{name}"]
        l.get("mykey", {name: "Winston"}) // -> ["Mr Winston", "Mrs Winston"]
  */

  clicked(lexiPath: string, isInEditMode: boolean = true) {
    if (isInEditMode) {
      return {'data-lexicon': lexiPath}
    }
    return {}
  }

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
    return new Lexicon(this._data, this.currentLocaleCode, rootPathExcludingLocale );
  }

  inspect() {
    return `<${this.constructor.name} ${JSON.stringify(this, null, 2)}>`
  }

  inspect() {
    return `<${this.constructor.name} ${JSON.stringify(this, null, 2)}>`
  }


  /* Determine the complete "key path" to retrieve our value */
  private fullKey(locale:LocaleCode, keyPath:KeyPath) {
    var parts = lodash_fp.compact([locale, col.keyPathAsString(this._subsetRoot), col.keyPathAsString(keyPath)]);
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
        return result; // Found it!
      };

      let nextNode = undefined;

      if (node instanceof Lexicon) {
        lexicon = node;
        localPrefix = []
        rootPrefix = rootPrefix.concat(['_data', locale])
        keyPath = lodash_concat(col.keyPathAsArray(lexicon._subsetRoot), keyPath);
        nextNode = lodash_fp.get([locale], lexicon._data);
      } else {
        const firstKey = keyPath[0];
        keyPath = keyPath.slice(1);
        rootPrefix = rootPrefix.concat([firstKey]); // use concat to not modify old value
        localPrefix = localPrefix.concat([firstKey]);
        nextNode = lodash_get(node, firstKey);
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
    const result = lodash_fp.keys(this._data) as Array<LocaleCode>;

    const index = result.indexOf('repoPath')
    if (index > -1) { // only splice array when item is found
      result.splice(index, 1) // 2nd parameter means remove one item only
    }

    return result
  }


  // filename and path of the JSON file that contains this data, e.g. 'path/to/content.json'
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
      for (const [key, node] of lodash_fp.entries(c)) {

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

  /* return [array of [key, value]] pairs in the current locale */
  entries(): Array<[KeyPathString, any]> {
    return this.keys().map( key => [key, this.get(key)] )
  }

  /* Returns new instance, with a value changed.
   * Note that updatePath is interepreted from the root of this Lexicon, and ignores current
   * locale and subset settings
   */
  set(updatePath: KeyPath, newValue: any): Lexicon {
    if (!lodash_fp.has(updatePath, this)) throw new Error(`node ${updatePath} does not exist`)

    return lodash_fp.set(updatePath, newValue, this)
  }
}
