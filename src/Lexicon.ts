interface NestedMap<K, V> extends Map<K, V|NestedMap<K, V>> {}
export type RawLexicon = NestedMap<string, string>;
export type RawLexiconObject = {
  [key: string]: string|Array<RawLexiconObject>|RawLexiconObject,
};

export type Locales = Map<string, RawLexicon>;
export type LocalesObject = {
  [lang: string]: RawLexiconObject,
};

const getNestedKeyInMap = <T>(map: NestedMap<string, T>, key: string): T|NestedMap<string, T>|null => {
  const [first, ...rest] = key.split('.');

  if (!map.has(first)) return null;

  const val = map.get(first);
  if (rest.length > 0) {
    if (val instanceof Map) {
      return getNestedKeyInMap(val, rest.join('.'));
    } else {
      return null;
    }
  } else {
    return val;
  }
};

const convertRawLexiconObjectToMap = (obj: RawLexiconObject): RawLexicon => {
  const lex: RawLexicon = new Map();

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

const flattenMap = <T>(map: NestedMap<string, T>): Array<string> => {
  const flatKeys: Array<string> = [];

  const recurse = (map: NestedMap<string, T>, prefix: string) => {
    for (const [k, v] of map.entries()) {
      if (v instanceof Map) {
        recurse(v, `${prefix}${k}.`);
      } else {
        flatKeys.push(`${prefix}${k}`);
      }
    }
  };

  recurse(map, '');
  return flatKeys;
};

export class Lexicon {
  private locales: Locales;
  public defaultLocale: string;

  constructor(locales: LocalesObject|Locales, defaultLocale: string) {
    this.defaultLocale = defaultLocale;

    if (locales instanceof Map) {
      this.locales = locales;
    } else {
      this.locales = new Map();
      for (let lang in locales) {
        this.locales.set(lang, convertRawLexiconObjectToMap(locales[lang]));
      }
    }
  }

  locale(locale: string): Lexicon|null {
    if (!this.locales.has(locale)) return null;
    return new Lexicon(this.locales, locale);
  }

  get(key: string): string|null {
    const locale = this.locales.get(this.defaultLocale);
    const val = getNestedKeyInMap(locale, key);
    if (val instanceof Map) {
      return null;
    } else {
      return val;
    }
  }

  subset(path: string): Lexicon|null {
    const newLocales: Locales = new Map();

    for (const [localeKey, localeMap] of this.locales.entries()) {
      const sub = getNestedKeyInMap(localeMap, path);
      if (sub instanceof Map) {
        newLocales.set(localeKey, sub);
      }
    }

    if (newLocales.size === 0) return null;

    return new Lexicon(newLocales, this.defaultLocale);
  }

  keys(): Array<string> {
    const localeMap = this.locales.get(this.defaultLocale);
    if (localeMap === undefined) return [];
    return flattenMap(localeMap);
  }

  update(key: string, newValue: string, locale: string = this.defaultLocale): boolean {
    if (!this.locales.has(locale)) return false;

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
      const localeMap = this.locales.get(locale);
      if (!localeMap.has(key)) {
        return false;
      } else {
        localeMap.set(key, newValue);
        return true;
      }
    }
  }
}
