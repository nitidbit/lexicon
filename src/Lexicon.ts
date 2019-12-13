import { Collection, NestedMap, flattenMap, cloneNestedMap, evaluateTemplate } from './util';
import * as util from './util';
import _ from 'lodash';

type LocaleCode = string;
const DEFAULT_LOCALE_CODE = 'en';

// Specifies keys in a tree of collections, either as dotted strings 'key.2.anotherKey'
// or as an array ['key', 2, 'anotherKey']
type NestedKey = Array<LocaleCode> | string;

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
export type RawLexiconMap = NestedMap<string, any>;


// e.g. { "en": ..., "es": ... }
export type Locales = Map<LocaleCode, RawLexiconMap>;
export type LocalesObject = {
  [lang: string]: RawLexiconObject,
};

const convertRawLexiconObjectToMap = (obj: RawLexiconObject): RawLexiconMap => {
  const lex: RawLexiconMap = new Map();

  for (const k in obj) {
    const val = obj[k];
    if (_.isString(val)
      || _.isNull(val)
      || _.isNumber(val)
      || _.isBoolean(val)
      || _.isArray(val)
    ) {
      lex.set(k, val);
//     } else if (val instanceof Array) {
// //       const obj = val.reduce((acc, v, i) => ({ ...acc, [i]: v }), {});
// //       lex.set(k, convertRawLexiconObjectToMap(obj));
//       lex.set(k, val);
    } else {
      lex.set(k, convertRawLexiconObjectToMap(val as {string:any}));
    }
  }

  return lex;
};

const convertRawLexiconMapToObject = (map: RawLexiconMap): RawLexiconObject => {
  const obj: RawLexiconObject = {};

  const convertValue = (val: string | RawLexiconMap): string | Array<RawLexiconObject> | RawLexiconObject => {
    if (_.isString(val)) {
      return val;
    } else {
      const numericKeys = [...val.keys()].every(k => k.match(/^\d+$/) != null);
      const consecutiveKeys = numericKeys && (
          [...val.keys()]
            .map(k => parseInt(k))
            .sort((a, b) => a - b)
            .every((n, i, a) => i == 0 ? true : (n - a[i - 1] == 1))
        );

      if (numericKeys && consecutiveKeys) {
        // array!
        const arr: Array<RawLexiconObject> = new Array(val.size);
        for (const [k, v] of val) {
          arr[parseInt(k)] = convertValue(v) as RawLexiconObject;
        }
        return arr;
      } else {
        // object!
        const obj: RawLexiconObject = {};
        for (const [k, v] of val) {
          obj[k] = convertValue(v);
        }
        return obj;
      }
    }
  };

  for (const [k, v] of map) {
    obj[k] = convertValue(v);
  }

  return obj;
}

export class Lexicon {
  private _contentByLocale: Locales;
  public currentLocaleCode: string; // e.g. 'en', 'es'
  private _filename: string;

  constructor(_locales: LocalesObject | Locales, localeCode: string, filename: string) {
    this.currentLocaleCode = localeCode;
    this._filename = filename;

    if (_.isMap(_locales)) {
      this._contentByLocale = _locales;
    } else {
      this._contentByLocale = new Map();
      for (let lang in _locales) {
        this._contentByLocale.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
      }
    }
  }

  // Return a new Lexicon with same contens, but different default language code
  locale(languageCode: LocaleCode): Lexicon | null {
    if (!this._contentByLocale.has(languageCode)) return null;
    return new Lexicon(this._contentByLocale, languageCode, this._filename);
  }

  // Return language codes for available locales
  locales(): Array<LocaleCode> {
    return [...this._contentByLocale.keys()];
  }

  filename(): string {
    return this._filename;
  }

  // Return a value from the Lexicon, in the current locale.
  // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
  //    e.g. "hello #{name}" -> "hello Winston"
  get(key: NestedKey, templateSubstitutions?: object): string | null {
    const localizedContent = this._contentByLocale.get(this.currentLocaleCode);

    let val = getNested(localizedContent, key);

    if (_.isUndefined(val)) { // could not find data--try English
      const defaultContent = this._contentByLocale.get(DEFAULT_LOCALE_CODE);
      val = getNested(defaultContent, key);

      if (_.isUndefined(val)) { // still couldn't find it--return a clue of the problem
        return `[no content for "${key}"]`;
      }
    }

    if (_.isString(val) && !_.isUndefined(templateSubstitutions)) {
      val = evaluateTemplate(val, templateSubstitutions);
    }

    return val;
  }

  // Return a new Lexicon, with the "root" starting at a different place.
  // E.g.
  //   a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
  //   a.subset('secondLevel') // --> Lexicon({title: "Mister"})
  subset(nestedKey: string): Lexicon | null {
    const newLocales: Locales = new Map();

    for (const [localeKey, localeMap] of this._contentByLocale) {
      const sub = getNested(localeMap, nestedKey);
      if (_.isMap(sub)) {
        newLocales.set(localeKey, sub);
      }
    }

    if (newLocales.size === 0) return null;

    return new Lexicon(newLocales, this.currentLocaleCode, this._filename);
  }

  keys(): Array<string> {
    const localeMap = this._contentByLocale.get(this.currentLocaleCode);
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

  update(key: string, newValue: string, locale: LocaleCode = this.currentLocaleCode): boolean {
    if (!this._contentByLocale.has(locale)) return false;

    if (key.includes('.')) {
      const firstPath = key.substr(0, key.lastIndexOf('.')),
        tailKey = key.substr(key.lastIndexOf('.') + 1),
        subset = this.locale(locale).subset(firstPath);

      if (subset === null) {
        return false;
      } else {
        return subset.update(tailKey, newValue, locale);
      }
    } else {
      const localeMap = this._contentByLocale.get(locale);
      if (!localeMap.has(key)) {
        return false;
      } else {
        localeMap.set(key, newValue);
        return true;
      }
    }
  }

  clone(): Lexicon {
    const newMap = new Map(this._contentByLocale);
    for (const [lang, lexicon] of newMap) {
      newMap.set(lang, cloneNestedMap(lexicon));
    }

    return new Lexicon(newMap, this.currentLocaleCode, this._filename);
  }

  asObject(): LocalesObject {
    const obj: LocalesObject = {};
    for (const [lang, locale] of this._contentByLocale) {
      obj[lang] = convertRawLexiconMapToObject(locale);
    }
    return obj;
  }
}

function getFromCollection(collection: Collection, key: string) {
  if (_.isMap(collection)) return collection.get(key);
  return collection[key];
}

// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function getNested(data: Collection, nestedKey: NestedKey): any {
  if (_.isNull(nestedKey) || _.isUndefined(nestedKey)) throw new Error("'nestedKey' is null/undefined")
  if (_.isNull(data) || _.isUndefined(data)) throw new Error("'data' is null/undefined")

  if (!util.isCollection(data)) {
    return undefined; // content not found
  }

  if (_.isString(nestedKey)) {
    nestedKey = nestedKey.split('.');
  }
  const [firstKey, ...rest] = nestedKey;
  const subData = getFromCollection(data, firstKey);

  if (rest.length == 0) {
    return subData; // we found it
  }

  return getNested(subData, rest.join('.'));
}

