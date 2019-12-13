import { Collection, NestedKey, NestedMap, flattenMap, cloneNestedMap, evaluateTemplate } from './util';
import * as util from './util';
import _ from 'lodash';

type LocaleCode = string;
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

// const convertRawLexiconObjectToMap = (obj: RawLexiconObject): RawLexiconMap => {
//   const lex: RawLexiconMap = new Map();

//   for (const k in obj) {
//     const val = obj[k];
//     if (_.isString(val)
//       || _.isNull(val)
//       || _.isNumber(val)
//       || _.isBoolean(val)
//       || _.isArray(val)
//     ) {
//       lex.set(k, val);
// //     } else if (val instanceof Array) {
// // //       const obj = val.reduce((acc, v, i) => ({ ...acc, [i]: v }), {});
// // //       lex.set(k, convertRawLexiconObjectToMap(obj));
// //       lex.set(k, val);
//     } else {
//       lex.set(k, convertRawLexiconObjectToMap(val as {string:any}));
//     }
//   }

//   return lex;
// };

// const convertRawLexiconMapToObject = (map: RawLexiconMap): RawLexiconObject => {
//   const obj: RawLexiconObject = {};

//   const convertValue = (val: string | RawLexiconMap): string | Array<RawLexiconObject> | RawLexiconObject => {
// console.log('!!! convertRaw..ToObject val=', val);
//     if (_.isString(val)) {
//       return val;
//     } else {
//       const numericKeys = [...val.keys()].every(k => k.match(/^\d+$/) != null);
//       const consecutiveKeys = numericKeys && (
//           [...val.keys()]
//             .map(k => parseInt(k))
//             .sort((a, b) => a - b)
//             .every((n, i, a) => i == 0 ? true : (n - a[i - 1] == 1))
//         );

//       if (numericKeys && consecutiveKeys) {
//         // array!
//         const arr: Array<RawLexiconObject> = new Array(val.size);
//         for (const [k, v] of val) {
//           arr[parseInt(k)] = convertValue(v) as RawLexiconObject;
//         }
//         return arr;
//       } else {
//         // object!
//         const obj: RawLexiconObject = {};
//         for (const [k, v] of val) {
//           obj[k] = convertValue(v);
//         }
//         return obj;
//       }
//     }
//   };

//   for (const [k, v] of map) {
//     obj[k] = convertValue(v);
//   }

//   return obj;
// }

export class Lexicon {
  private _contentByLocale: Locales;
  public currentLocaleCode: string; // e.g. 'en', 'es'
  private _filename: string;

  constructor(_locales: LocalesObject | Locales, localeCode: string, filename: string) {
    this.currentLocaleCode = localeCode;
    this._filename = filename;
    this._contentByLocale = _locales;
//     if (_.isMap(_locales)) {
//       this._contentByLocale = _locales;
//     } else {
//       this._contentByLocale = new Map();
//       for (let lang in _locales) {
//         this._contentByLocale.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
//       }
//     }
  }

  // Return a new Lexicon with same contens, but different default language code
  locale(languageCode: LocaleCode): Lexicon | null {
    if (!util.has(this._contentByLocale, languageCode)) return null;
    return new Lexicon(this._contentByLocale, languageCode, this._filename);
  }

  // Return language codes for available locales
  locales(): Array<LocaleCode> {
    return util.keys(this._contentByLocale) as Array<string>;
  }

  filename(): string {
    return this._filename;
  }

  // Return a value from the Lexicon, in the current locale.
  // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
  //    e.g. "hello #{name}" -> "hello Winston"
  get(key: NestedKey, templateSubstitutions?: object): string | null {
    const localizedContent = util.get(this._contentByLocale, this.currentLocaleCode);

    let val = util.get(localizedContent, key);

    if (_.isUndefined(val)) { // could not find data--try English
      const defaultContent = util.get(this._contentByLocale, DEFAULT_LOCALE_CODE);
      val = util.get(defaultContent, key);

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
  subset(nestedKey: NestedKey): Lexicon | null {
    let newLocales: Locales = {};

    // copy sub content for each language
    for (const [langKey, localizedContent] of util.entries(this._contentByLocale)) {
      const subContent = util.get(localizedContent, nestedKey);
      util.set(newLocales, langKey, subContent);
    }

    return new Lexicon(newLocales, this.currentLocaleCode, this._filename);
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

  update(key: string, newValue: string, locale: LocaleCode = this.currentLocaleCode): boolean {
    if (!util.has(this._contentByLocale, locale)) return false;

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
      const localeMap = util.get(this._contentByLocale, locale);
      if (! util.has(localeMap, key)) {
        return false;
      } else {
        util.set(localeMap, key, newValue);
        return true;
      }
    }
  }

  clone(): Lexicon {
//     const newMap = new Map(this._contentByLocale);
//     for (const [lang, lexicon] of newMap) {
//       newMap.set(lang, cloneNestedMap(lexicon));
//     }

    return new Lexicon(util.clone(this._contentByLocale), this.currentLocaleCode, this._filename);
  }

  asObject(): LocalesObject {
    return this._contentByLocale;
//     const obj: LocalesObject = {};
//     for (const [lang, locale] of this._contentByLocale) {
//       obj[lang] = convertRawLexiconMapToObject(locale);
//     }
//     return obj;
  }
}

