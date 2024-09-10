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
        map: new Map([['mapKey', 'MAP VALUE']]),
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

    test('works for Maps', () => {
      expect(lex.get('map.mapKey')).toEqual('MAP VALUE');
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
        'map.mapKey',
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


  describe('cloneDeep()', () => {
    test('returns a copy of the Lexicon', () => {
      const cloned = lex.cloneDeep();
      for (const k of cloned.keys()) {
        expect(cloned.get(k)).toEqual(lex.get(k));
      }

      for (const k of cloned.locale('es').keys()) {
        expect(cloned.locale('es').get(k)).toEqual(lex.locale('es').get(k));
      }
    });

    test('returns an independent copy', () => {
      const clone1 = lex.cloneDeep();
      const clone2 = lex.cloneDeep();

      clone1.update(clone1.source('foo').updatePath, 'FOO 1');

      expect(clone1.get('foo')).toEqual('FOO 1');
      expect(clone2.get('foo')).toEqual('bar');
      expect(lex.get('foo')).toEqual('bar');
    });
  });


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

      lex.update(info.updatePath, 'NEW VALUE');
      expect(lex.get('foo')).toEqual('NEW VALUE');
    });

    test('raises exception when node is not found', () => {
      expect(() => lex.source('does.not.exist')).toThrow(/does.not.exist/);
    });

    test('works with locale("es")', () => {
      const info = lex.locale("es").source('foo');

      expect(info.filename).toEqual('blah.json');
      expect(info.localPath).toEqual(['es', 'foo']);

      lex.update(info.updatePath, 'NEW VALUE');
      expect(lex.locale("es").get('foo')).toEqual('NEW VALUE');

    });

    test('works with subset("nested")', () => {
      let info = lex.subset('nested').source('wom');

      expect(info.filename).toEqual('blah.json');
      expect(info.localPath).toEqual(['en', 'nested', 'wom']);

      lex.update(info.updatePath, 'NEW VALUE');
      expect(lex.subset('nested').get('wom')).toEqual('NEW VALUE');
    });

    test('works with Lexicons inside Lexicons', () => {
      let info = lex.source('subLex.subFoo');

      expect(info.filename).toEqual('subLex.json');
      expect(info.localPath).toEqual(['en', 'subFoo']);

      lex.update(info.updatePath, 'NEW VALUE');
      expect(lex.get('subLex.subFoo')).toEqual('NEW VALUE');
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
        A.update(updatePath, 'NEW VALUE');
        expect(A.get('a.c')).toEqual('NEW VALUE')
      });
    });
  });

  describe('update()', () => {
    let lex2 = null;

    beforeEach( ()=> {
      lex2 = lex.cloneDeep();
    });

    test('updates the key and returns true', () => {
      expect(lex2.update(lex2.source('nested.wom').updatePath, 'NEW BAT')).toEqual(true);
      expect(lex2.get('nested.wom')).toEqual('NEW BAT');
    });


    test('output of source() can be used to update()', () => {
      let info = lex.source('nested.wom');
      lex2.update(info.updatePath, 'NEW BAT')

      expect(lex2.get('nested.wom')).toEqual('NEW BAT')
      expect(lex.get('nested.wom')).toEqual('bat')
    });

    test('works for nested Lexicons', () => {
      let info = lex.source('subLex.subFoo');
      lex2.update(info.updatePath, 'NEW-sub-foo')

      expect(lex.get('subLex.subFoo')).toEqual('SUB FOO')
      expect(lex2.get('subLex.subFoo')).toEqual('NEW-sub-foo')
    });

    test('returns false if path or locale does not exist', () => {
      expect(lex.update('blah.123', 'foobar')).toEqual(false);
    });
  });

  describe('addBranch()', () => {
    let lex1, lex2;

    beforeEach( () => {
      lex1 = new Lexicon({repoPath: 'lex1.json', en: { one: 'ONE' }});
      lex2 = new Lexicon({repoPath: 'lex2.json', en: { two: 'TWO' }});

      lex1.addBranch(lex2, 'added');
    });

    test('returns a Lexicon containing keys from both underlying Lexicons', () => {
      expect(lex1.get('one')).toEqual('ONE');
      expect(lex1.get('added.two')).toEqual('TWO');
    });

    test('subsets work with added subLexicons', () => {
      let addedLex = lex1.subset('added');
      expect(addedLex.get('two')).toEqual('TWO');
    });

    test('saving/updating subsets of a sub-lexicon work', () => {
      let addedLex = lex1.subset('added');
      lex.update(addedLex.source('two').updatePath, 'NEW VALUE');
      expect(addedLex.get('two')).toEqual('TWO');
    })
  })

  describe('addSubLexicon()', () => {
    test('addSubLexicon is an alias for addBranch', () => {
      let lex1 = new Lexicon({repoPath: 'lex1.json', en: { one: 'ONE' }});
      let lex2 = new Lexicon({repoPath: 'lex2.json', en: { two: 'TWO' }});

      lex1.addSubLexicon(lex2, 'added');

      expect(lex1.get('added.two')).toEqual('TWO');
    });
  });
});
