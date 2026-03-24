import { Lexicon } from '../Lexicon'
import { LexiconHub } from './LexiconHub'

/** One tracked edit, matching what LxEditPanel stores in unsavedChanges Map values */
export type UnsavedLexiconChange = {
  originalValue: string
  newValue: string
  updatePath: string
}

/**
 * Snapshot original string for a field before the first edit in a session (same idea as LxEditPanel).
 * localPath is like "es.orig_json.favColor" from LexiconEditor.
 */
export function getOriginalValueForLocalPath(
  hub: LexiconHub,
  localPath: string
): string | undefined {
  const dotIndex = localPath.indexOf('.')
  if (dotIndex === -1) return undefined
  const locale = localPath.substring(0, dotIndex)
  const pathWithoutLocale = localPath.substring(dotIndex + 1)
  const localeHub = hub.locale(locale)
  return localeHub?.getExact(pathWithoutLocale)
}

/**
 * Apply the same revert logic as "Throw away changes and close" in LxEditPanel.
 * Kept in one module so Jest can lock the behavior without rendering the panel.
 */
export function throwAwayLexiconHub(
  prevHub: LexiconHub,
  unsavedChanges: Iterable<UnsavedLexiconChange>
): LexiconHub {
  const localeToPreserve = prevHub.currentLocaleCode
  let revertedHub: LexiconHub = prevHub

  for (const change of unsavedChanges) {
    const { originalValue, updatePath } = change
    revertedHub = Lexicon.prototype.set.call(
      revertedHub,
      updatePath,
      originalValue
    ) as LexiconHub
    revertedHub = revertedHub.reSyncBranchesAfterLexiconSet(updatePath)
  }
  return revertedHub.locale(localeToPreserve) ?? revertedHub
}
