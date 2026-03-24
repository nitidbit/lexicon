import { LexiconHub } from './LexiconHub'

/** One tracked edit, matching what LxEditPanel stores in unsavedChanges Map values */
export type UnsavedLexiconChange = {
  originalValue: string
  newValue: string
  updatePath: string
}

/**
 * Snapshot the pre-edit string for a field (same as LxEditPanel). Use the hub field key from the
 * editor (`change.hubFieldKey`), not `localPath` — localPath is `keyPathAsString(source.localPath)`
 * and omits branch keys (e.g. `es.title` vs `strings_json.title`).
 */
export function getOriginalValueForHubFieldKey(
  hub: LexiconHub,
  hubFieldKey: string
): string | undefined {
  return hub.getExact(hubFieldKey)
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
    if (originalValue === undefined) continue
    // Same path as typing: LexiconHub.set runs super.set + propagateSharedBranchLexicons.
    revertedHub = revertedHub.set(updatePath, originalValue) as LexiconHub
  }
  return revertedHub.locale(localeToPreserve) ?? revertedHub
}
