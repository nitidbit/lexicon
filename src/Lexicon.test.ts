import { Lexicon } from './Lexicon';

describe('Lexicon module', () => {
  const lexObj = {
    en: {
      foo: 'bar',
      nested: {
        wom: 'bat',
      },
      arrayOfObjects: [
        { text: 'one' },
        { text: 'two' },
      ],
      template: '\\#{escaped} \\\\ #{foo} #{bar.baz} #{{{manyBrackets}}}'
    },
    es: {
      foo: 'bar_es',
      nested: {
        wom: 'murciélago',
      },
      arrayOfObjects: [
        { text: 'uno' },
        { text: 'dos' },
      ],
      onlyExistsInSpanish: 'hola, ¿cómo estás?'
    },
  };

  const lex = new Lexicon(lexObj, 'en', 'blah.json');

  describe('new Lexicon()', () => {
    test('has the correct defaultLocale', () => {
      expect(lex.defaultLocale).toEqual('en');
    });
  });

  describe('get()', () => {
    test('works for a single key', () => {
      expect(lex.get('foo')).toEqual('bar');
    });

    test('returns null for keys that do not exist or are nested', () => {
      expect(lex.get('blah')).toEqual(null);
      expect(lex.get('nested')).toEqual(null);
    });

    test('works for nested keys', () => {
      expect(lex.get('nested.wom')).toEqual('bat');
    });

    test('works for arrays of objects', () => {
      expect(lex.get('arrayOfObjects.0.text')).toEqual('one');
      expect(lex.get('arrayOfObjects.1.text')).toEqual('two');
    });

    test('works for templates', () => {
      expect(lex.get('template', {
        foo: 'foo',
        bar: { baz: 'baz' },
        '{{manyBrackets}}': 'qux'
      })).toEqual('#{escaped} \\ foo baz qux');
    })
  });

  describe('locale()', () => {
    const es = lex.locale('es');

    test('returns a Lexicon with a new defaultLocale', () => {
      expect(es.defaultLocale).toEqual('es');
    });

    test('returns a Lexicon that gives values from the new locale', () => {
      expect(es.get('foo')).toEqual('bar_es');
      expect(es.get('blah')).toEqual(null);
      expect(es.get('nested.wom')).toEqual('murciélago');
      expect(es.get('arrayOfObjects.0.text')).toEqual('uno');
      expect(es.get('arrayOfObjects.1.text')).toEqual('dos');
    });

    test('can be called multiple times in a chain', () => {
      const newLex = lex.locale('es').subset('nested').locale('en');
      expect(newLex.get('wom')).toEqual('bat');
      expect(newLex.defaultLocale).toEqual('en');
    });
  });

  describe('subset()', () => {
    const subset = lex.subset('nested');

    test('retains the defaultLocale', () => {
      expect(subset.defaultLocale).toEqual('en');
      expect(lex.locale('es').subset('nested').defaultLocale).toEqual('es');
    });

    test('returns a new Lexicon that provides nested values', () => {
      expect(subset.get('wom')).toEqual('bat');
      expect(subset.locale('es').get('wom')).toEqual('murciélago');
    });

    test('returns null for non-existent or non-nested keys', () => {
      expect(lex.subset('blah')).toEqual(null);
      expect(lex.subset('foo')).toEqual(null);
    });
  });

  describe('keys()', () => {
    test('returns an array of dotted keys for the default locale', () => {
      expect(lex.keys()).toEqual(['foo', 'nested.wom', 'arrayOfObjects.0.text', 'arrayOfObjects.1.text', 'template']);
      expect(lex.locale('es').keys()).toEqual(['foo', 'nested.wom', 'arrayOfObjects.0.text', 'arrayOfObjects.1.text', 'onlyExistsInSpanish']);
    });
  });

  describe('update()', () => {
    test('updates the key and returns true', () => {
      expect(lex.update('nested.wom', 'foobar', 'es')).toEqual(true);
      expect(lex.locale('es').get('nested.wom')).toEqual('foobar');
    });

    test('uses the default locale if none is specified', () => {
      expect(lex.update('nested.wom', 'abc')).toEqual(true);
      expect(lex.get('nested.wom')).toEqual('abc');
    });

    test('returns false if path or locale does not exist', () => {
      expect(lex.update('blah.123', 'foobar', 'en')).toEqual(false);
      expect(lex.update('nested.blah', 'foobar', 'en')).toEqual(false);
      expect(lex.update('nested.wom', 'foobar', 'fakeLanguage')).toEqual(false);
    });
  });

  describe('clone()', () => {
    test('returns a copy of the Lexicon', () => {
      const cloned = lex.clone();
      for (const k of cloned.keys()) {
        expect(cloned.get(k)).toEqual(lex.get(k));
      }

      for (const k of cloned.locale('es').keys()) {
        expect(cloned.locale('es').get(k)).toEqual(lex.locale('es').get(k));
      }
    });

    test('returns an independent copy', () => {
      const clone1 = lex.clone(),
        clone2 = lex.clone();
      clone1.update('foo', 'abc');
      expect(clone1.get('foo')).toEqual('abc');
      expect(clone2.get('foo')).toEqual('bar');
      expect(lex.get('foo')).toEqual('bar');
    });
  });

  describe('locales()', () => {
    test('returns a list of defined locales', () => {
      expect(lex.locales()).toEqual(['en', 'es']);
    });
  });

  describe('asObject()', () => {
    test('returns the correct representation of the Lexicon', () => {
      expect(new Lexicon(lexObj, 'en', 'blah.json').asObject()).toEqual(lexObj);
    });
  });
});
