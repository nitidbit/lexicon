import { LexiconHub } from './LexiconHub';
import { Lexicon } from '../Lexicon';

describe('LexiconHub', () => {
  describe('register()', () => {
    it('reuses the original version if called twice with the same content so edits are maintained', () => {
      const hub = new LexiconHub()
      const lex1 = hub.register({repoPath: 'orig.json', en: { favColor: 'MAGENTA' } })
      const lex2 = hub.register({repoPath: 'orig.json', en: { favColor: 'PINK' } })

      expect(lex2.get('favColor')).toEqual('MAGENTA')
    })
  })

  describe('set()', () => {
    it('returns new Lexicon with the changed value, leaving original unchanged', () => {
      const hub = new LexiconHub()
      const lexOrig = hub.register({repoPath: 'orig.json', en: { favColor: 'PINK' } })

      const updatePath = hub.source('orig_json.favColor').updatePath
      const hub2 = hub.set(updatePath, 'MAGENTA')
      expect(hub2.get('orig_json.favColor')).toEqual('MAGENTA') // copy is changed
      expect(hub.get('orig_json.favColor')).toEqual('PINK') // original unchanged
    })
  })

  describe('lexiconWithRepoPath()', () => {
    it('returns Lexicon given the repoPath', () => {
      const hub = new LexiconHub()
      hub.register({repoPath: 'orig.json', en: { favColor: 'PINK' } })
      const lex = hub.register({repoPath: 'other.json', en: { food: 'AVOCADOS' } })

      expect(hub.lexiconWithRepoPath('other.json')).toEqual(lex)
    })

    it('returns null when the Lexicon has not been registered', () => {
      const hub = new LexiconHub()
      hub.register({repoPath: 'orig.json', en: { favColor: 'PINK' } })

      expect(hub.lexiconWithRepoPath('NON-EXISTANT.json')).toEqual(null)
    })
  })

  describe('locale()', () => {
    it('returns instance of LexiconHub', () => {
      const hubEN = new LexiconHub()

      const hubES = hubEN.locale('es')
      expect(hubES).toBeInstanceOf(LexiconHub)
    })
  })

  describe('addBranch()', () => {
    let hub, lex2;

    beforeEach( () => {
      hub = new LexiconHub({repoPath: 'hub.json', en: { one: 'ONE' }});
      lex2 = new Lexicon({repoPath: 'lex2.json', en: { two: 'TWO' }});

      hub.addBranch(lex2, 'added');
    });

    test('returns a Lexicon containing keys from both underlying Lexicons', () => {
      expect(hub.get('one')).toEqual('ONE');
      expect(hub.get('added.two')).toEqual('TWO');
    });

    test('subsets work with added subLexicons', () => {
      let addedLex = hub.subset('added');
      expect(addedLex.get('two')).toEqual('TWO');
    });
  })
})
