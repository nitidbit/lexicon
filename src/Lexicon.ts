import { NestedMap, getNestedKeyInMap, flattenMap, cloneNestedMap, evaluateTemplate } from './util';

// RawLexiconObject -- the content inside a lexicon string file, in Object form, excluding locale
// identifiers. I.e. everything underneath { "en": ... }
export type RawLexiconObject = {
  [key: string]: string
  | Array<RawLexiconObject>
  | RawLexiconObject,
};

// RawLexiconMap -- The content inside a lexicon string file, in Map() form.
//   After loading the RawLexiconObject, we convert and store it as a Map.
export type RawLexiconMap = NestedMap<string, string>;


// e.g. { "en": ..., "es": ... }
export type Locales = Map<string, RawLexiconMap>;
export type LocalesObject = {
  [lang: string]: RawLexiconObject,
};

const convertRawLexiconObjectToMap = (obj: RawLexiconObject): RawLexiconMap => {
  const lex: RawLexiconMap = new Map();

  for (const k in obj) {
    const val = obj[k];
    if (typeof val == 'string') {
      lex.set(k, val);
    } else if (val instanceof Array) {
      const obj = val.reduce((acc, v, i) => ({ ...acc, [i]: v }), {});
      lex.set(k, convertRawLexiconObjectToMap(obj));
    } else {
      lex.set(k, convertRawLexiconObjectToMap(val));
    }
  }

  return lex;
};

const convertRawLexiconMapToObject = (map: RawLexiconMap): RawLexiconObject => {
  const obj: RawLexiconObject = {};

  const convertValue = (val: string | RawLexiconMap): string | Array<RawLexiconObject> | RawLexiconObject => {
    if (typeof val == 'string') {
      return val;
    } else {
      const numericKeys = [...val.keys()].every(k => k.match(/^\d+$/)),
        consecutiveKeys = numericKeys && (
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
  private _locales: Locales;
  public defaultLocale: string;
  public filename: string;

  constructor(_locales: LocalesObject | Locales, defaultLocale: string, filename: string) {
    this.defaultLocale = defaultLocale;
    this.filename = filename;

    if (_locales instanceof Map) {
      this._locales = _locales;
    } else {
      this._locales = new Map();
      for (let lang in _locales) {
        this._locales.set(lang, convertRawLexiconObjectToMap(_locales[lang]));
      }
    }
  }

  // Return a new Lexicon with same contens, but different default language code
  locale(languageCode: string): Lexicon | null {
    if (!this._locales.has(languageCode)) return null;
    return new Lexicon(this._locales, languageCode, this.filename);
  }

  // Return language codes for available locales
  locales(): Array<string> {
    return [...this._locales.keys()];
  }

  // Return a value from the Lexicon, in the current locale.
  // If you pass 'templateSubsitutions', and the value is a string, then they they are inserted into your string,
  //    e.g. "hello #{name}" -> "hello Winston"
  get(key: string, templateSubstitutions?: unknown): string | null {
    const locale = this._locales.get(this.defaultLocale);
    const val = getNestedKeyInMap(locale, key);
    if (val instanceof Map) {
      return null;
    } else {
      if (templateSubstitutions !== undefined) {
        return evaluateTemplate(val, templateSubstitutions);
      } else {
        return val;
      }
    }
  }

  // Return a new Lexicon, with the "root" starting at a different place.
  // E.g.
  //   a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
  //   a.subset('secondLevel') // --> Lexicon({title: "Mister"})
  subset(path: string): Lexicon | null {
    const newLocales: Locales = new Map();

    for (const [localeKey, localeMap] of this._locales) {
      const sub = getNestedKeyInMap(localeMap, path);
      if (sub instanceof Map) {
        newLocales.set(localeKey, sub);
      }
    }

    if (newLocales.size === 0) return null;

    return new Lexicon(newLocales, this.defaultLocale, this.filename);
  }

  keys(): Array<string> {
    const localeMap = this._locales.get(this.defaultLocale);
    if (localeMap === undefined) return [];
    return flattenMap(localeMap);
  }

  update(key: string, newValue: string, locale: string = this.defaultLocale): boolean {
    if (!this._locales.has(locale)) return false;

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
      const localeMap = this._locales.get(locale);
      if (!localeMap.has(key)) {
        return false;
      } else {
        localeMap.set(key, newValue);
        return true;
      }
    }
  }

  clone(): Lexicon {
    const newMap = new Map(this._locales);
    for (const [lang, lexicon] of newMap) {
      newMap.set(lang, cloneNestedMap(lexicon));
    }

    return new Lexicon(newMap, this.defaultLocale, this.filename);
  }

  asObject(): LocalesObject {
    const obj: LocalesObject = {};
    for (const [lang, locale] of this._locales) {
      obj[lang] = convertRawLexiconMapToObject(locale);
    }
    return obj;
  }
}
