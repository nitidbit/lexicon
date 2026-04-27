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

  /** OVERRIDING SET() to fix live preview for non-default/Spanish edits:
      Propagate non-default locale edits to shared _data so register() sees them (live preview). */
  set(updatePath: KeyPath, newValue: any): Lexicon {
    const result = super.set(updatePath, newValue) as LexiconHub

    return this.propagateSharedBranchLexicons(result, updatePath)
  }

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
    // Typical path when editing `orig_json.favColor` on hub.locale('es') — hub column, branch
    // key (filename with dots → underscores), then path inside that file’s Lexicon:
    //   ['_data', 'es', 'orig_json', '_data', 'es', 'favColor']
    //     ↑        ↑       ↑            ↑        ↑        ↑
    //   hub._data  locale  branch      nested   locale   field (may be deeper)
    const [
      hubDataKey,
      hubLocaleColumn,
      branchKey,
      branchLexiconDataKey,
      _branchInnerLocale,
      ..._pathWithinBranchLexicon
    ] = path

    const isNonDefaultLocaleEdit =
      path.length >= 5 &&
      hubDataKey === '_data' &&
      branchLexiconDataKey === '_data' &&
      hubLocaleColumn !== DEFAULT_LOCALE_CODE
    const updatedLexicon = hub._data[hubLocaleColumn]?.[branchKey]

    if (!isNonDefaultLocaleEdit || !(updatedLexicon instanceof Lexicon)) {
      return hub
    }

    const sharedData = (updatedLexicon as Lexicon & { _data: ContentByLocale })
      ._data
    const cloned = { ...hub._data } as Record<string, unknown>
    // Replace branch Lexicon for every locale (including updatedLocale). Skipping the edited
    // locale left a Lexicon instance whose _data could disagree with `sharedData` after a
    // structural Lexicon.prototype.set on revert, so register() (en branch) + .locale("es") saw English.
    for (const locale of hub.locales()) {
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

/** One tracked edit, matching what LxEditPanel stores in unsavedChanges Map values */
export type UnsavedLexiconChange = {
  originalValue: string
  newValue: string
  updatePath: string
}

/**
 * Apply the same revert logic as "Throw away changes and close" in LxEditPanel.
 * Kept on this module so Jest can lock the behavior without rendering the panel.
 */
export function throwAwayLexiconHub(
  prevHub: LexiconHub,
  unsavedChanges: Iterable<UnsavedLexiconChange>
): LexiconHub {
  const localeToPreserve = prevHub.currentLocaleCode
  let revertedHub: LexiconHub = prevHub

  for (const change of unsavedChanges) {
    const { originalValue, updatePath } = change
    if (originalValue === undefined) continue
    // Same path as typing: LexiconHub.set runs super.set + propagateSharedBranchLexicons.
    revertedHub = revertedHub.set(updatePath, originalValue) as LexiconHub
  }
  return revertedHub.locale(localeToPreserve) ?? revertedHub
}
