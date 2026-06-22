import { getURLParameter } from '../util'

let editorStylesLoadPromise: Promise<void> | null = null

/** True when edit mode can be enabled via sessionStorage or URL token. */
export const hasLexiconServerToken = (): boolean => {
  try {
    if (sessionStorage.lexiconServerToken) return true
  } catch {
    // sessionStorage may be unavailable (e.g. some privacy modes)
  }
  return !!getURLParameter('lexiconServerToken')
}

/** Dynamically import editor CSS once, when editing may be used. */
export const ensureEditorStylesLoaded = (): void => {
  if (!editorStylesLoadPromise) {
    editorStylesLoadPromise = import('./allEditorStyles.css').then(() => {})
  }
}
