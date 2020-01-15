import { Collection, isCollection, KeyPath, keyPathAsString, keyPathAsArray, evaluateTemplate } from './util';
import * as util from './util';
import _ from 'lodash';

type LocaleCode = string; // e.g. 'en', 'es'
const DEFAULT_LOCALE_CODE = 'en';

export type ContentByLocale = {
  [localeCode: string]: object | Map<any, any>,
};

export class Lexicon {
  private _contentByLocale: ContentByLocale;
  public currentLocaleCode: LocaleCode;
  private _filename: string;
  private _rootKeyPath: KeyPath;

  constructor(contentByLocale: ContentByLocale,
              localeCode: LocaleCode,
              filename: string,
              subset: KeyPath = '') {
    this.currentLocaleCode = localeCode;
    this._filename = filename;
    this._contentByLocale = contentByLocale;
    this._rootKeyPath = subset;
  }

  //
  //    Methods for use by Lexicon clients
  //

  /* Return a new Lexicon with same contens, but different default language code */
  locale(localeCode: LocaleCode): Lexicon | null {
    if (!util.has(this._contentByLocale, localeCode)) return null;
    return new Lexicon(this._contentByLocale, localeCode, this._filename, this._rootKeyPath);
  }

  /*
     Return a value from the Lexicon, in the current locale.
     If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
        e.g. "hello #{name}" -> "hello Winston"
  */
  get(keyPath: KeyPath, templateSubstitutions?: object): any {
    if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

    // Get one level
    function recursiveGet(data: any, keyPath: Array<string>): any {
      if (_.isNil(data)) throw new Error("'data' is null/undefined")
      if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

      const [firstKey, ...restOfKeys] = keyPath;
      let subData = undefined;

      if (data instanceof Lexicon) {
        subData = data.get(firstKey);
      } else {
        subData = util.get(data, firstKey);
      }

      if (restOfKeys.length == 0) {
        return subData; // we found it
      }

      return recursiveGet(subData, restOfKeys);
    }

    let fullKey = keyPathAsArray(this._fullKey(this.currentLocaleCode, keyPath));
    let val = recursiveGet(this._contentByLocale, fullKey);

    if (_.isUndefined(val)) { // could not find data--try English
      val = util.get(this._contentByLocale, this._fullKey(DEFAULT_LOCALE_CODE, keyPath));

      if (_.isUndefined(val)) { // still couldn't find it--return a clue of the problem
        return `[no content for "${keyPathAsString(fullKey)}"]`;
      }
    }

    if (_.isString(val) && !_.isUndefined(templateSubstitutions)) {
      val = evaluateTemplate(val, templateSubstitutions);
    }

    return val;
  }

  /* Return a new Lexicon, with the "root" starting at a different place.
     E.g.
       a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
       a.subset('secondLevel') // --> Lexicon({title: "Mister"})
  */
  subset(keyPath: KeyPath): Lexicon | null {
    let rootPathExcludingLocale = this._fullKey(null, keyPath);
    return new Lexicon(this._contentByLocale, this.currentLocaleCode, this._filename, rootPathExcludingLocale);
  }

  /* Determine the complete "key path" to retrieve our value */
  private _fullKey(locale:LocaleCode, keyPath:KeyPath) {
    var parts = _.compact([locale, keyPathAsString(this._rootKeyPath), keyPathAsString(keyPath)]);
    return parts.join('.');
  }

//   private info(...
  info(locale: LocaleCode, keyPath: KeyPath): {lexicon:Lexicon, locale:string, keyPath:KeyPath} | null {
    if (locale.length != 2) throw new Error("'locale' should be LocaleCode, e.g. 'en'");
    if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined");

    function recursiveFind(
        node: Collection | Lexicon,
        keyPath: Array<string>,
        lexicon: Lexicon,
        prefix: Array<string>) {
//       console.log('!!! recursiveFind() prefix=', prefix, 'keyPath=', keyPath, 'node=', node)

      if (_.isNil(node)) throw new Error("'node' is null/undefined")
      if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined")

      const [firstKey, ...restOfKeys] = keyPath;
      let nextNode = undefined;

      if (node instanceof Lexicon) { // Is this a nested Lexicon?
        lexicon = node;
        prefix = [firstKey]; // Reset prefix to ignore parent Lexicons
        nextNode = lexicon.locale(locale).get(firstKey);
      } else {
        prefix = prefix.concat([firstKey]); // use concat to not modify old value of 'prefix'
        nextNode = util.get(node, firstKey);
      }

      if (restOfKeys.length == 0) {
        return { // we found it
          lexicon: lexicon,
          locale: locale,
          keyPath: prefix,
        };
      };

      return recursiveFind(nextNode, restOfKeys, lexicon, prefix);
    };

    let fullPathExcludingLocale = this._fullKey(null, keyPath)

    return recursiveFind(this, keyPathAsArray(fullPathExcludingLocale), this, []);
  }

  //
  //    Methods for use by Lexicon Editor
  //

  /*
     Returns the filename and KeyPath of the item in question.
     The returned keyPath might be different from the input because you're looking
     at a Lexicon subset, with some keys hidden.
   */
  source(keyPath: KeyPath): {filename:string, keyPath:KeyPath} | null {
    let info = this.info(this.currentLocaleCode, keyPath);
    return {
      filename: info.lexicon.filename(),
      keyPath: [info.locale].concat(info.keyPath),
    };
  }


  /* Return language codes for available locales */
  locales(): Array<LocaleCode> {
    return util.keys(this._contentByLocale) as Array<string>;
  }

  /* Used by LexiconEditor */
  filename(): string {
    return this._filename;
  }


  /* Return list of dotted keys, e.g. ['mycomponent.title', 'mycomponent.page1.intro'] */
  keys(): Array<string> {
    const localeMap = util.get(this._contentByLocale, this.currentLocaleCode);
    if (localeMap === undefined) return [];

    let flatKeys: Array<string> = [];
    const recurse = (c: Collection, prefix: string) => {
      for (const [k, v] of util.entries(c)) {

        if (v instanceof Lexicon) {
          const subKeys = v.keys();
          const prefixedKeys = _.map(subKeys, (keyPath) => `${prefix}${k}.${keyPath}`);
          console.log('!!! keys() prefixedKeys=', prefixedKeys);
          flatKeys = flatKeys.concat(prefixedKeys);

        } else if (util.isCollection(v)) {
          recurse(v, `${prefix}${k}.`);

        } else {
          flatKeys.push(`${prefix}${k}`);
        }
      }
    };

    recurse(localeMap, '');
    return flatKeys;
  }

  /* Set a value in the Lexicon */
  update(keyPath: KeyPath, newValue: any, locale: LocaleCode = this.currentLocaleCode): boolean {
    let fullPath = this._fullKey(locale, keyPath);
    if (! util.has(this._contentByLocale, fullPath)) {
      return false; // We don't have that locale
    }

    util.set(this._contentByLocale, fullPath, newValue);
    return true; // success
  }

  /* Used by LexiconEditor */
  clone(): Lexicon {
    return new Lexicon(_.cloneDeep(this._contentByLocale), this.currentLocaleCode, this._filename, this._rootKeyPath);
  }

  /* Used by LexiconEditor */
//   asObject(): ContentByLocale {
//     return this._contentByLocale;
//   }
}

