import { Lexicon } from './Lexicon';

describe('Lexicon module', () => {
  const lex = new Lexicon({
    en: {
      foo: 'bar',
      nested: {
        wom: 'bat',
      },
    },
    es: {
      foo: 'bar_es',
      nested: {
        wom: 'bat_es',
      },
    },
  }, 'en');

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
  });

  describe('locale()', () => {
    const es = lex.locale('es');

    test('returns a Lexicon with a new defaultLocale', () => {
      expect(es.defaultLocale).toEqual('es');
    });

    test('returns a Lexicon that gives values from the new locale', () => {
      expect(es.get('foo')).toEqual('bar_es');
      expect(es.get('blah')).toEqual(null);
      expect(es.get('nested.wom')).toEqual('bat_es');
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
      expect(subset.locale('es').get('wom')).toEqual('bat_es');
    });

    test('returns null for non-existent or non-nested keys', () => {
      expect(lex.subset('blah')).toEqual(null);
      expect(lex.subset('foo')).toEqual(null);
    });
  });
});
