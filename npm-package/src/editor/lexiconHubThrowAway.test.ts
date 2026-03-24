import { keyPathAsString } from '../collection'
import { LexiconHub } from './LexiconHub'
import {
  getOriginalValueForHubFieldKey,
  throwAwayLexiconHub,
  type UnsavedLexiconChange,
} from './lexiconHubThrowAway'

/**
 * Regression tests for "Throw away changes and close": the hub returned must keep
 * register() / useLexicon() in sync with the reverted strings for each locale.
 *
 * Mirrors LxEditPanel: edit uses LexiconHub.set; unsaved map stores updatePath + originalValue
 * from getOriginalValueForHubFieldKey + hub field key; throw away uses throwAwayLexiconHub.
 *
 */
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
    const originalValue = getOriginalValueForHubFieldKey(
      hubBeforeEdit,
      fieldKey
    ) as string
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
