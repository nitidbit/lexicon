import { Collection, KeyPath, evaluateTemplate } from './util';
import * as util from './util';
import _ from 'lodash';

type LocaleCode = string; // e.g. 'en', 'es'
const DEFAULT_LOCALE_CODE = 'en';

// RawLexiconObject -- the content inside a lexicon string file, in Object form, excluding locale
// identifiers. I.e. everything underneath { "en": ... }
export type RawLexiconObject = {
  [key: string]:
    null |
    string |
    number |
    boolean |
    object |
    Array<any>
//     | Array<RawLexiconObject>
//     | RawLexiconObject,
};

// RawLexiconMap -- The content inside a lexicon string file, in Map() form.
//   After loading the RawLexiconObject, we convert and store it as a Map.
export type RawLexiconMap = {
  [lang: string]: object | Map<any, any>
};
// export type RawLexiconMap = NestedMap<string, any>;


// e.g. { "en": ..., "es": ... }
export type Locales = LocalesObject;
// export type Locales = Map<LocaleCode, RawLexiconMap>;
export type LocalesObject = {
  [lang: string]: object | Map<any, any>,
//   [lang: string]: RawLexiconObject,
};

export class Lexicon {
  private _contentByLocale: Locales;
  public currentLocaleCode: LocaleCode;
  private _filename: string;
  private _rootKeyPath: KeyPath;

  constructor(contentByLocale: LocalesObject | Locales,
              localeCode: LocaleCode,
              filename: string,
              subset: KeyPath = '') {
    this.currentLocaleCode = localeCode;
    this._filename = filename;
    this._contentByLocale = contentByLocale;
    this._rootKeyPath = subset;
  }

  // Return a new Lexicon with same contens, but different default language code
  locale(localeCode: LocaleCode): Lexicon | null {
    if (!util.has(this._contentByLocale, localeCode)) return null;
    return new Lexicon(this._contentByLocale, localeCode, this._filename, this._rootKeyPath);
  }

  // Return language codes for available locales
  locales(): Array<LocaleCode> {
    return util.keys(this._contentByLocale) as Array<string>;
  }

  filename(): string {
    return this._filename;
  }

  /*
     Return a value from the Lexicon, in the current locale.
     If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
        e.g. "hello #{name}" -> "hello Winston"
  */
  get(key: KeyPath, templateSubstitutions?: object): string | null {
    let fullKey = this._fullKey(this.currentLocaleCode, key);
    let val = util.get(this._contentByLocale, fullKey);

    if (_.isUndefined(val)) { // could not find data--try English
      val = util.get(this._contentByLocale, this._fullKey(DEFAULT_LOCALE_CODE, key));

      if (_.isUndefined(val)) { // still couldn't find it--return a clue of the problem
        return `[no content for "${fullKey}"]`;
      }
    }

    if (_.isString(val) && !_.isUndefined(templateSubstitutions)) {
      val = evaluateTemplate(val, templateSubstitutions);
    }

    return val;
  }

  private _fullKey(localeCode:LocaleCode, keyPath:KeyPath) {
    var parts = _.compact([localeCode, this._rootKeyPath, keyPath]);
    return parts.join('.');
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

  /*
     Returns the filename and KeyPath of the item in question.
     The returned keyPath might be different from the input because you're looking
     at a Lexicon subset, with some keys hidden.
   */
  source(keyPath: KeyPath): {filename: string, keyPath: KeyPath} {
    return {
      filename: this.filename(),
      keyPath: this._fullKey(this.currentLocaleCode, keyPath),
    };
  }

  keys(): Array<string> {
    const localeMap = util.get(this._contentByLocale, this.currentLocaleCode);
    if (localeMap === undefined) return [];

    const flatKeys: Array<string> = [];
    const recurse = (c: Collection, prefix: string) => {
      for (const [k, v] of util.entries(c)) {
        if (util.isCollection(v)) {
          recurse(v, `${prefix}${k}.`);
        } else {
          flatKeys.push(`${prefix}${k}`);
        }
      }
    };

    recurse(localeMap, '');
    return flatKeys;
  }

  update(key: string, newValue: any, localeCode: LocaleCode = this.currentLocaleCode): boolean {
    let fullPath = this._fullKey(localeCode, key);
    if (! util.has(this._contentByLocale, fullPath)) {
      return false; // We don't have that locale
    }

    util.set(this._contentByLocale, fullPath, newValue);
    return true; // success
  }

  clone(): Lexicon {
    return new Lexicon(_.cloneDeep(this._contentByLocale), this.currentLocaleCode, this._filename, this._rootKeyPath);
  }

  asObject(): LocalesObject {
    return this._contentByLocale;
  }
}

