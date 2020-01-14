import { Collection, KeyPath, keyPathAsString, keyPathAsArray, evaluateTemplate } from './util';
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

  // Return a new Lexicon with same contens, but different default language code
  locale(localeCode: LocaleCode): Lexicon | null {
    if (!util.has(this._contentByLocale, localeCode)) return null;
    return new Lexicon(this._contentByLocale, localeCode, this._filename, this._rootKeyPath);
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
  private _fullKey(localeCode:LocaleCode, keyPath:KeyPath) {
    var parts = _.compact([localeCode, keyPathAsString(this._rootKeyPath), keyPathAsString(keyPath)]);
    return parts.join('.');
  }

  /* Used by LexiconEditor

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

  /* Used by LexiconEditor
     Return language codes for available locales
   */
  locales(): Array<LocaleCode> {
    return util.keys(this._contentByLocale) as Array<string>;
  }

  /* Used by LexiconEditor */
  filename(): string {
    return this._filename;
  }


  /* Used by LexiconEditor */
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

  /* Used by LexiconEditor */
  update(key: string, newValue: any, localeCode: LocaleCode = this.currentLocaleCode): boolean {
    let fullPath = this._fullKey(localeCode, key);
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
  asObject(): ContentByLocale {
    return this._contentByLocale;
  }
}

