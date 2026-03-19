import { KeyPath, keyPathAsArray } from '../collection'
import * as col from '../collection'
import {
  Lexicon,
  ContentByLocale,
  LocaleCode,
  DEFAULT_LOCALE_CODE,
} from '../Lexicon'

// Used by LxProvider to cache Lexicons currently in use.
export class LexiconHub extends Lexicon {
  /** OVERRIDING SET() to fix live preview for non-default/Spanish edits: 
      Propagate non-default locale edits to shared _data so register() sees them (live preview). */
  set(updatePath: KeyPath, newValue: any): Lexicon {
    const result = super.set(updatePath, newValue) as LexiconHub
    const path = keyPathAsArray(updatePath)
    const isNonDefaultLocaleEdit =
      path.length >= 5 &&
      path[0] === '_data' &&
      path[3] === '_data' &&
      path[1] !== DEFAULT_LOCALE_CODE
    if (!isNonDefaultLocaleEdit) return result

    const [updatedLocale, branchKey] = [path[1], path[2]]
    const updatedLexicon = result._data[updatedLocale]?.[branchKey]
    if (!(updatedLexicon instanceof Lexicon)) return result

    const sharedData = (updatedLexicon as Lexicon & { _data: ContentByLocale })
      ._data
    const cloned = { ...result._data } as Record<string, unknown>
    for (const locale of result.locales()) {
      if (locale === updatedLocale) continue
      const branch = { ...(cloned[locale] as object) } as Record<
        string,
        Lexicon
      >
      branch[branchKey] = new Lexicon(sharedData as ContentByLocale, locale)
      cloned[locale] = branch
    }

    return new LexiconHub(
      cloned as ContentByLocale,
      result.currentLocaleCode
    ) as LexiconHub
  }

  constructor(
    contentByLocale: ContentByLocale = {
      repoPath: 'SHARED LEXICON HUB',
      en: {},
      es: {},
    },
    localeCode: LocaleCode = DEFAULT_LOCALE_CODE,
    subset: KeyPath = ''
  ) {
    super(contentByLocale, localeCode, subset)
  }

  register(
    contentByLocale: ContentByLocale,
    localeCode: LocaleCode | null = null
  ): Lexicon {
    const desiredLocale = localeCode || this.currentLocaleCode
    const existingLexicon = this.lexiconWithRepoPath(contentByLocale.repoPath)

    if (existingLexicon) {
      if (existingLexicon.currentLocaleCode === desiredLocale) {
        return existingLexicon
      }
      return existingLexicon.locale(desiredLocale) // same lexicon path, but different locale
    }

    const newLexicon = new Lexicon(contentByLocale, desiredLocale)
    this.addBranch(newLexicon, this.rootKey(newLexicon))
    return newLexicon
  }

  lexiconWithRepoPath(repoPath: string): Lexicon {
    for (const [key, node] of Object.entries(
      this._data[DEFAULT_LOCALE_CODE] as col.Collection
    )) {
      if (node instanceof Lexicon && node.filename() == repoPath) {
        return node
      }
    }
    return null // not found
  }

  lexiconForTab(tabName: string): Lexicon | null {
    const found = super.lexiconForTab(tabName)
    if (found) return found
    for (const [key, node] of Object.entries(
      this._data[DEFAULT_LOCALE_CODE] as col.Collection
    )) {
      if (node instanceof Lexicon) {
        const child = node.lexiconForTab(tabName)
        if (child) return child
      }
    }
    return null
  }

  //
  //    Private methods
  //

  /* Merge a second 'subLexicon' in under the key 'branchKey'. */
  addBranch(subLexicon: Lexicon, branchKey: string): void {
    for (const locale of this.locales()) {
      this._data[locale][branchKey] = subLexicon.locale(locale)
    }
  }
}
