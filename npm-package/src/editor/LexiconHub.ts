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
  /**
   * After a structural update at a branch (via Lexicon.set / super.set), keep every locale’s
   * branch Lexicon pointing at the same ContentByLocale. Otherwise en/es diverge (clone splits
   * shared _data) and register() — which reads from the default-locale branch — shows the wrong
   * language after reverting Spanish edits.
   */
  propagateSharedBranchLexicons(
    hub: LexiconHub,
    updatePath: KeyPath
  ): LexiconHub {
    const path = keyPathAsArray(updatePath)
    const isNonDefaultLocaleEdit =
      path.length >= 5 &&
      path[0] === '_data' &&
      path[3] === '_data' &&
      path[1] !== DEFAULT_LOCALE_CODE
    if (!isNonDefaultLocaleEdit) return hub

    const [updatedLocale, branchKey] = [path[1], path[2]]
    const updatedLexicon = hub._data[updatedLocale]?.[branchKey]
    if (!(updatedLexicon instanceof Lexicon)) return hub

    const sharedData = (updatedLexicon as Lexicon & { _data: ContentByLocale })
      ._data
    const cloned = { ...hub._data } as Record<string, unknown>
    for (const locale of hub.locales()) {
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
      hub.currentLocaleCode
    ) as LexiconHub
  }

  /** OVERRIDING SET() to fix live preview for non-default/Spanish edits:
      Propagate non-default locale edits to shared _data so register() sees them (live preview). */
  set(updatePath: KeyPath, newValue: any): Lexicon {
    const result = super.set(updatePath, newValue) as LexiconHub
    return this.propagateSharedBranchLexicons(result, updatePath)
  }

  /** Call after `Lexicon.prototype.set` on this hub so branch Lexicons stay aligned (see propagateSharedBranchLexicons). */
  reSyncBranchesAfterLexiconSet(updatePath: KeyPath): LexiconHub {
    return this.propagateSharedBranchLexicons(this, updatePath)
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
