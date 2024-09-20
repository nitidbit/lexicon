import { Lexicon } from './Lexicon';

describe('Lexicon module', () => {
  let lex;

  beforeEach( ()=> {
    const subLex = new Lexicon({
        repoPath: 'subLex.json', en: { subFoo: 'SUB FOO' }}, 'en');

    let color:string = "";

    const lexObj = {
      repoPath: 'blah.json',
      en: {
        foo: 'bar',
        nested: {
          wom: 'bat',
        },
        arrayOfObjects: [
          { text: 'one' },
          { text: 'two' },
        ],
        arrayOfStrings: [ "ichi", "ni", "san" ],
        template: '\\#{escaped} \\\\ #{foo} #{bar.baz} #{{{manyBrackets}}}',
        onlyExistsInEnglish: 'EN only',
        subLex: subLex,
        string: 'this is a #{color} string',
        array: [
          'this is the first element in #{color}',
          'this is the second element',
        ]
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

    lex = new Lexicon(lexObj);
  });

  describe('new Lexicon()', () => {
    test('has the correct currentLocaleCode', () => {
      expect(lex.currentLocaleCode).toEqual('en');
    });

    test('raises error when it doesn\'t have "en" locale', () => {
      const JSON_CONTENT = {repoPath: 'missing.json', es: {title: 'en locale'}}
      expect(() => new Lexicon(JSON_CONTENT)).toThrow(/must contain 'en/)
    });

    test('raises error when it doesn\'t have "repoPath"', () => {
      const JSON_CONTENT = {en: {}}
      expect(() => new Lexicon(JSON_CONTENT)).toThrow(/must contain 'repoPath/)
    });
  });


  describe('get()', () => {
    test('works for a single key', () => {
      expect(lex.get('foo')).toEqual('bar');
    });

    test('returns warning for keys that do not exist', () => {
      expect(lex.get('blah')).toEqual('[no content for "en.blah"]');
    });

    test('works for nested keys', () => {
      expect(lex.get('nested.wom')).toEqual('bat');
    });

    test('nested keys may be passed as array', () => {
      expect(lex.get(['nested', 'wom'])).toEqual('bat');
    });

    test('works for arrays of objects', () => {
      expect(lex.get('arrayOfObjects.0.text')).toEqual('one');
      expect(lex.get('arrayOfObjects.1.text')).toEqual('two');
    });

    test('works for arrays of strings', () => {
      expect(lex.get('arrayOfStrings.0')).toEqual('ichi');
      expect(lex.get('arrayOfStrings.1')).toEqual('ni');
      expect(lex.get('arrayOfStrings.2')).toEqual('san');
    });

    test('works for templates', () => {
      expect(lex.get('template', {
        foo: 'foo',
        bar: { baz: 'baz' },
        '{{manyBrackets}}': 'qux'
      })).toEqual('#{escaped} \\ foo baz qux');
    });

    test('works with Lexicons inside Lexicons', () => {
      expect(lex.get('subLex.subFoo')).toEqual('SUB FOO');
    });

    test('returns correct values for "string" key', () => {
      expect(lex.get('string', { color: 'blue'})).toEqual('this is a blue string');
    });

    test('interpolates array elements correctly', () => {
      const result = lex.get('array', { color: 'blue' });
      expect(result).toEqual([
          'this is the first element in blue',
          'this is the second element'
      ]);
    });
  });


  describe('locale()', () => {
    let es;

    beforeEach( ()=> {
      es = lex.locale('es');
    });


    test('returns a Lexicon with a new currentLocaleCode', () => {
      expect(es.currentLocaleCode).toEqual('es');
    });

    test('returns a Lexicon that gives values from the new locale', () => {
      expect(es.get('foo')).toEqual('bar_es');
      expect(es.get('nested.wom')).toEqual('murciélago');
      expect(es.get('arrayOfObjects.0.text')).toEqual('uno');
      expect(es.get('arrayOfObjects.1.text')).toEqual('dos');
    });

    test('returns English data when the localized data is missing', () => {
      expect(es.get('onlyExistsInEnglish')).toEqual('EN only');
    });

    test('can be called multiple times in a chain', () => {
      const newLex = lex.locale('es').subset('nested').locale('en');
      expect(newLex.get('wom')).toEqual('bat');
      expect(newLex.currentLocaleCode).toEqual('en');
    });

    test('locale and nested Lexicons work together', ()=> {
      expect(lex.locale('es').subset('subLex').locale('en').get('subFoo')).toEqual('SUB FOO');
    });
  });


  describe('subset()', () => {
    let subset;

    beforeEach( ()=>{
      subset = lex.subset('nested');
    });

    test('retains the currentLocaleCode', () => {
      expect(subset.currentLocaleCode).toEqual('en');
      expect(lex.locale('es').subset('nested').currentLocaleCode).toEqual('es');
    });

    test('returns a new Lexicon that provides nested values', () => {
      expect(subset.get('wom')).toEqual('bat');
      expect(subset.locale('es').get('wom')).toEqual('murciélago');
    });

    test('returns empty Lexicon for non-existent or non-nested keys', () => {
      expect(lex.subset('blah')).toBeInstanceOf(Lexicon);
      expect(lex.subset('foo')).toBeInstanceOf(Lexicon);
    });
  });

  describe('keys()', () => {
    test('returns an array of dotted keys for the default locale', () => {
      expect(lex.keys()).toEqual([
        'foo',
        'nested.wom',
        'arrayOfObjects.0.text',
        'arrayOfObjects.1.text',
        'arrayOfStrings.0',
        'arrayOfStrings.1',
        'arrayOfStrings.2',
        'template',
        'onlyExistsInEnglish',
        'subLex.subFoo',
        'string',
        'array.0',
        'array.1'
      ]);
    });

    test('works with different locales', () => {
      expect(lex.locale('es').keys())
        .toEqual(['foo', 'nested.wom', 'arrayOfObjects.0.text', 'arrayOfObjects.1.text', 'onlyExistsInSpanish']);
    });

    test('keys() for subsets only returns keys under that subset', () => {
      expect(lex.subset('nested').keys())
        .toEqual(['wom']);
    });
  });

  describe('entries()', () => {
    test('returns [array of [key, value]] pairs in the current locale', () => {
      expect(lex.entries()).toEqual([
        ['foo', 'bar'],
        ['nested.wom', 'bat'],
        ['arrayOfObjects.0.text', 'one'],
        ['arrayOfObjects.1.text', 'two'],
        ['arrayOfStrings.0', "ichi"],
        ['arrayOfStrings.1', "ni"],
        ['arrayOfStrings.2', "san"],
        ['template', '\\#{escaped} \\\\ #{foo} #{bar.baz} #{{{manyBrackets}}}'],
        ['onlyExistsInEnglish', 'EN only'],
        ['subLex.subFoo', 'SUB FOO'],
        ['string', 'this is a #{color} string'],
        ['array.0', 'this is the first element in #{color}'],
        ['array.1', 'this is the second element'],
      ])
    })
  })

  describe('locales()', () => {
    test('returns a list of defined locales', () => {
      expect(lex.locales()).toEqual(['en', 'es']);
    });
  });

  describe('source()', () => {
    test('returns keyPath and filename for editing the file', () => {
      const info = lex.source('foo');

      expect(info.filename).toEqual('blah.json')
      expect(info.localPath).toEqual(['en', 'foo'])

      const lex2 = lex.set(info.updatePath, 'NEW VALUE');
      expect(lex2.get('foo')).toEqual('NEW VALUE');
    });

    test('raises exception when node is not found', () => {
      expect(() => lex.source('does.not.exist')).toThrow(/does.not.exist/);
    });

    test('works with locale("es")', () => {
      const info = lex.locale("es").source('foo');

      expect(info.filename).toEqual('blah.json');
      expect(info.localPath).toEqual(['es', 'foo']);

      const lex2 = lex.set(info.updatePath, 'NEW VALUE');
      expect(lex2.locale("es").get('foo')).toEqual('NEW VALUE');

    });

    test('works with subset("nested")', () => {
      let info = lex.subset('nested').source('wom');

      expect(info.filename).toEqual('blah.json');
      expect(info.localPath).toEqual(['en', 'nested', 'wom']);

      const lex2 = lex.set(info.updatePath, 'NEW VALUE');
      expect(lex2.subset('nested').get('wom')).toEqual('NEW VALUE');
    });

    test('works with Lexicons inside Lexicons', () => {
      let info = lex.source('subLex.subFoo');

      expect(info.filename).toEqual('subLex.json');
      expect(info.localPath).toEqual(['en', 'subFoo']);

      const lex2 = lex.set(info.updatePath, 'NEW VALUE');
      expect(lex2.get('subLex.subFoo')).toEqual('NEW VALUE');
    });

    describe('with Lexicon.subset() inside Lexicons', () => {
      let A, BC;

      beforeAll( ()=>{
        BC = new Lexicon({repoPath: 'BC.json', en: {b: {c: "CCC"}}});
        A = new Lexicon({repoPath: 'A.json', en: {a: BC.subset('b')}});
      });

      test('returns filename and key path', () => {
        expect(A.source('a.c').filename).toEqual('BC.json')
        expect(A.source('a.c').localPath).toEqual(['en', 'b', 'c'])
      });

      test('returns updatePath that works with .update()', () => {
        const updatePath = A.source('a.c').updatePath;
        const A2 = A.set(updatePath, 'NEW VALUE');
        expect(A2.get('a.c')).toEqual('NEW VALUE')
      });
    });
  });

  describe('set()', () => {
    let lex2 = null;

    test('returns new Lexicon with the key changed but the rest of thes structure the same', () => {
      const updatePath = [ '_data', 'en', 'nested', 'wom' ]
      const lex2 = lex.set(updatePath, 'NEW BAT')
      expect(lex2.get('nested.wom')).toEqual('NEW BAT');
    });


    test('output of source().updatePath can be used for set()', () => {
      let info = lex.source('nested.wom');
      const lex2 = lex.set(info.updatePath, 'NEW BAT')

      expect(lex2.get('nested.wom')).toEqual('NEW BAT')
      expect(lex.get('nested.wom')).toEqual('bat')
    });

    test('works for nested Lexicons', () => {
      let info = lex.source('subLex.subFoo');
      const lex2 = lex.set(info.updatePath, 'NEW-sub-foo')

      expect(lex.get('subLex.subFoo')).toEqual('SUB FOO')
      expect(lex2.get('subLex.subFoo')).toEqual('NEW-sub-foo')
    });

    test('raises Error if path or locale does not exist', () => {
      expect(() => lex.set('blah.123', 'foobar')).toThrow()
    });
  })
});
