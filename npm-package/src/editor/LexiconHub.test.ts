import { keyPathAsString } from '../collection'
import { Lexicon } from '../Lexicon'
import {
  LexiconHub,
  throwAwayLexiconHub,
  type UnsavedLexiconChange,
} from './LexiconHub'

describe('LexiconHub', () => {
  describe('register()', () => {
    it('reuses the original version if called twice with the same content so edits are maintained', () => {
      const hub = new LexiconHub()
      hub.register({ repoPath: 'orig.json', en: { favColor: 'MAGENTA' } })
      const lex2 = hub.register({
        repoPath: 'orig.json',
        en: { favColor: 'PINK' },
      })

      expect(lex2.get('favColor')).toEqual('MAGENTA')
    })
  })

  describe('set()', () => {
    it('returns new Lexicon with the changed value, leaving original unchanged', () => {
      const hub = new LexiconHub()
      hub.register({ repoPath: 'orig.json', en: { favColor: 'PINK' } })

      const updatePath = hub.source('orig_json.favColor').updatePath
      const hub2 = hub.set(updatePath, 'MAGENTA')
      expect(hub2.get('orig_json.favColor')).toEqual('MAGENTA') // copy is changed
      expect(hub.get('orig_json.favColor')).toEqual('PINK') // original unchanged
    })
  })

  describe('lexiconWithRepoPath()', () => {
    it('returns Lexicon given the repoPath', () => {
      const hub = new LexiconHub()
      hub.register({ repoPath: 'orig.json', en: { favColor: 'PINK' } })
      const lex = hub.register({
        repoPath: 'other.json',
        en: { food: 'AVOCADOS' },
      })

      expect(hub.lexiconWithRepoPath('other.json')).toEqual(lex)
    })

    it('returns null when the Lexicon has not been registered', () => {
      const hub = new LexiconHub()
      hub.register({ repoPath: 'orig.json', en: { favColor: 'PINK' } })

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
    let hub, lex2

    beforeEach(() => {
      hub = new LexiconHub({ repoPath: 'hub.json', en: { one: 'ONE' } })
      lex2 = new Lexicon({ repoPath: 'lex2.json', en: { two: 'TWO' } })

      hub.addBranch(lex2, 'added')
    })

    test('returns a Lexicon containing keys from both underlying Lexicons', () => {
      expect(hub.get('one')).toEqual('ONE')
      expect(hub.get('added.two')).toEqual('TWO')
    })

    test('subsets work with added subLexicons', () => {
      let addedLex = hub.subset('added')
      expect(addedLex.get('two')).toEqual('TWO')
    })
  })

  describe('throwAwayLexiconHub (throw-away / discard changes)', () => {
    const bilingualContent = {
      repoPath: 'strings.json',
      en: { title: 'Hello' },
      es: { title: 'Hola' },
    }

    function buildChangeLikeEditPanel(args: {
      hubBeforeEdit: LexiconHub
      fieldKey: string
      newValue: string
    }): { editedHub: LexiconHub; unsaved: UnsavedLexiconChange[] } {
      const { hubBeforeEdit, fieldKey, newValue } = args
      const source = hubBeforeEdit.source(fieldKey)
      const updatePath = keyPathAsString(source.updatePath)
      const originalValue = hubBeforeEdit.getExact(fieldKey) as string
      const editedHub = hubBeforeEdit.set(updatePath, newValue) as LexiconHub
      const unsaved: UnsavedLexiconChange[] = [
        {
          originalValue,
          newValue,
          updatePath,
        },
      ]
      return { editedHub, unsaved }
    }

    it('after discarding a Spanish edit, register(..., "es") shows the original Spanish string, not English', () => {
      const hub = new LexiconHub()
      hub.register(bilingualContent)
      const hubEs = hub.locale('es')!

      const { editedHub, unsaved } = buildChangeLikeEditPanel({
        hubBeforeEdit: hubEs,
        fieldKey: 'strings_json.title',
        newValue: 'EDITED_ES',
      })
      expect(unsaved[0].originalValue).toBe('Hola')

      const reverted = throwAwayLexiconHub(editedHub, unsaved)
      const lexEs = reverted.register(bilingualContent, 'es')

      expect(lexEs.get('title')).toBe('Hola')
      expect(lexEs.get('title')).not.toBe('Hello')
      const asStr = String(lexEs.get('title'))
      expect(asStr).not.toMatch(/no content for/i)
    })

    it('preserves hub currentLocaleCode on the returned hub (editor locale)', () => {
      const hub = new LexiconHub()
      hub.register(bilingualContent)
      const hubEs = hub.locale('es')!
      const { editedHub, unsaved } = buildChangeLikeEditPanel({
        hubBeforeEdit: hubEs,
        fieldKey: 'strings_json.title',
        newValue: 'X',
      })

      const reverted = throwAwayLexiconHub(editedHub, unsaved)
      expect(reverted.currentLocaleCode).toBe('es')
    })
  })
})
