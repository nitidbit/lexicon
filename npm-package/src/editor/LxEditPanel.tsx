import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { LxPortalContext } from '../LxPortalContext'
import { keyPathAsString } from '../collection'
import { Lexicon } from '../Lexicon'
import { VERSION } from '../index'
import { LexiconEditor, OnChangeCallback } from './LexiconEditor'
import { LexiconHub } from './LexiconHub'

import { LxEditPanelType } from '../index'

import './LxEditPanelStyles.css'

type UserChanges = Map<
  string,
  { originalValue: string; newValue: string; updatePath: string }
>

/** Extract original value for a change, using the locale from localPath (e.g. "es.orig_json.favColor") */
function getOriginalValue(
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

enum Position {
  Left = 'left',
  Bottom = 'bottom',
  Right = 'right',
}

enum SavingState {
  NoChanges,
  Available,
  InProgress,
  Done,
  Error,
}

interface LexiconAPIResponse {
  successful: boolean
  error: string | null
}

/*
  The side panel where you can edit content.
  - Tracks changes and sends them to LexiconServer
  - Also includes controls to:
    - change position
    - choose locale
    - resize the panel
*/

const LxEditPanelNoPortal: LxEditPanelType = ({
  lexiconHub,
  setLexiconHub,
  visible, // Slide in or out?
  lexiconServerToken,
  apiUpdateUrl,
  toggleEditPanel, // called when user closes
  lexiconNameToDisplay,
  editPanelExcludeLexicons,
  panelApiRef,
}) => {
  //
  //    State
  //
  const [unsavedChanges, setUnsavedChanges] = useState<UserChanges>(new Map())
  const [savingState, setSavingState] = useState<SavingState>(
    SavingState.NoChanges
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [position, setPosition] = useState<Position>(Position.Right)
  const [editorWidth, setEditorWidth] = useState<number | null>(null)
  const [editorHeight, setEditorHeight] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  //
  //    Stateful Functions
  //

  const updateTextFromEditor: OnChangeCallback = (change) => {
    // console.log('!!! lxEditPanel.updateTextFromEditor change=', change)
    const newLexiconHub = lexiconHub.set(change.updatePath, change.newValue)

    const fileKey = JSON.stringify({
      filename: change.filename,
      localPath: change.localPath,
    }) // we stringify here because Javascript never treats multiple objects as the same one even
    // if the keys and values are all identical

    const existingChange = unsavedChanges.get(fileKey)
    let originalValue = existingChange && existingChange.originalValue

    // Add the new change, but into a clone of unsavedChanges to be immutable
    const newChanges = new Map(unsavedChanges)
    if (originalValue == change.newValue) {
      newChanges.delete(fileKey) // They changed it back to original value--no net change
    } else {
      originalValue =
        originalValue || getOriginalValue(lexiconHub, change.localPath)
      newChanges.set(fileKey, {
        originalValue,
        newValue: change.newValue,
        updatePath: keyPathAsString(change.updatePath),
      })
    }

    setLexiconHub(newLexiconHub)
    setUnsavedChanges(newChanges)
    setSavingState(
      newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available
    )
  }

  const saveChanges = (onSuccess?: () => void) => {
    setSavingState(SavingState.InProgress)

    const headers = {
      Authorization: `Bearer ${lexiconServerToken}`,
      'Content-Type': 'application/json',
    }
    const listOfChanges = [...unsavedChanges.entries()].map(
      ([fileKeyString, { newValue }]) => {
        const fileKey = JSON.parse(fileKeyString)

        return {
          filename: fileKey.filename,
          key: fileKey.localPath,
          newValue,
        }
      }
    )
    const payload = { changes: listOfChanges }
    if (apiUpdateUrl === 'demo') {
      setSavingState(SavingState.Error)
      setErrorMessage(
        "You are using a demo.  In a production application your changes would be written to Github directly into the JSON files on the branch you have indicated.  apiUpdateUrl should be set the the Lexicon server you are using.  You can run your own, or you can use NitidBit's server for a small fee."
      )
      return
    }
    if (!apiUpdateUrl) {
      setSavingState(SavingState.Error)
      setErrorMessage(
        "<LxProvider apiUpdateUrl=???> has no URL set, so nothing can be saved. Once the URL is set, your changes will be written to Github directly into the JSON files on whatever branch you indicate.  apiUpdateUrl should be set to the Lexicon server you are using. You can run your own, or you can use NitidBit's server for a small fee."
      )
      return
    }

    fetch(apiUpdateUrl, {
      method: 'PUT',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json: LexiconAPIResponse) => {
        if (json.successful) {
          setSavingState(SavingState.Done)
          setUnsavedChanges(new Map())
          setErrorMessage(null)
          onSuccess?.()
        } else {
          setSavingState(SavingState.Error)
          setErrorMessage(json.error)
        }
      })
      .catch((error) => {
        setSavingState(SavingState.Error)
        setErrorMessage(error.toString())
      })
  }

  const changePosition = (e: React.MouseEvent<HTMLInputElement>) => {
    const newPos = e.currentTarget.name

    if (
      (newPos === Position.Left || newPos === Position.Right) &&
      position !== Position.Bottom
    ) {
      const currentWidth = editorWidth
      setPosition(newPos)
      setEditorWidth(currentWidth)
    } else if (
      (newPos === Position.Left || newPos === Position.Right) &&
      position === Position.Bottom
    ) {
      setPosition(newPos)
      setEditorWidth(undefined)
    } else if (
      newPos === Position.Bottom &&
      (position === Position.Left || position === Position.Right)
    ) {
      setPosition(newPos)
      setEditorWidth(undefined)
    }
  }

  const startResizing = (e: React.MouseEvent) => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
  }

  const resize = (e: MouseEvent) => {
    if (position === Position.Right) {
      setEditorWidth(window.innerWidth - e.clientX)
    } else if (position === Position.Left) {
      setEditorWidth(e.clientX)
    } else if (position === Position.Bottom) {
      setEditorHeight(window.innerHeight - e.clientY)
    }
  }

  const stopResizing = () => {
    window.removeEventListener('mousemove', resize)
    window.removeEventListener('mouseup', stopResizing)
  }

  const setLocale = (newLocale) => {
    setLexiconHub(lexiconHub.locale(newLocale))
  }

  const handleCloseRequest = useCallback(() => {
    if (unsavedChanges.size > 0) {
      dialogRef.current?.showModal()
    } else {
      toggleEditPanel()
    }
  }, [unsavedChanges, toggleEditPanel])

  useEffect(() => {
    if (!panelApiRef) return
    panelApiRef.current = { requestClose: handleCloseRequest }
    return () => {
      panelApiRef.current = null
    }
  }, [panelApiRef, handleCloseRequest])

  const throwAwayAndClose = () => {
    setLexiconHub((prevHub: LexiconHub) => {
      const localeToPreserve = prevHub.currentLocaleCode
      let revertedHub: LexiconHub = prevHub

      for (const change of unsavedChanges.values()) {
        const { originalValue, updatePath } = change
        // Lexicon.set only: structural clone can split shared ContentByLocale between en/es
        // branches; LexiconHub.set runs super.set + propagation in one step and was fragile on
        // revert. Apply structural set, then re-sync branches like LexiconHub.set does.
        revertedHub = Lexicon.prototype.set.call(
          revertedHub,
          updatePath,
          originalValue
        ) as LexiconHub
        revertedHub = revertedHub.reSyncBranchesAfterLexiconSet(updatePath)
      }
      return revertedHub.locale(localeToPreserve) ?? revertedHub
    })
    setUnsavedChanges(new Map())
    setSavingState(SavingState.NoChanges)
    dialogRef.current?.close()
    toggleEditPanel()
  }

  const saveAndClose = () => {
    saveChanges(() => {
      dialogRef.current?.close()
      toggleEditPanel()
    })
  }

  //
  //    Rendering
  //
  let buttonText: string, buttonEnabled: boolean

  switch (savingState) {
    case SavingState.NoChanges:
      buttonText = 'Nothing to Save'
      buttonEnabled = false
      break
    case SavingState.Available:
      buttonText = 'Save changes'
      buttonEnabled = true
      break
    case SavingState.InProgress:
      buttonText = 'Saving...'
      buttonEnabled = false
      break
    case SavingState.Done:
      buttonText = 'Saved!'
      buttonEnabled = false
      break
    case SavingState.Error:
      buttonText = 'Save changes'
      buttonEnabled = true
      break
  }

  const className = [
    'LxEditPanel',
    `docked-${position}`,
    visible ? 'is-visible' : '',
  ].join(' ')

  return (
    <div
      className={className}
      style={{ width: editorWidth, height: editorHeight }}
    >
      <hgroup>
        <h2 className="wrapper-heading">{lexiconNameToDisplay}</h2>

        <div className="position">
          {[
            [Position.Left, '\u25e7'],
            [Position.Bottom, '\u2b13'],
            [Position.Right, '\u25e8'],
          ].map(([pos, icon]) => (
            <label key={pos} className={position == pos ? 'selected' : ''}>
              {icon}
              <input type="radio" name={pos} onClick={changePosition} />
            </label>
          ))}
        </div>
        <label className="close-btn">
          {' '}
          &times;
          <button onClick={handleCloseRequest} />
        </label>
      </hgroup>

      <LexiconEditor
        lexicon={lexiconHub}
        onChange={updateTextFromEditor}
        selectedLocale={lexiconHub.currentLocaleCode}
        switchLocale={setLocale}
        toggleEditor={handleCloseRequest}
        visible={visible}
        editPanelExcludeLexicons={editPanelExcludeLexicons}
      />
      <div className="save-box">
        <span className="version"> v{VERSION} </span>
        <button onClick={() => saveChanges()} disabled={!buttonEnabled}>
          {buttonText}
        </button>
      </div>
      {savingState == SavingState.Error && (
        <p className="error-message">{errorMessage}</p>
      )}
      <dialog ref={dialogRef} className="LxEditPanel-dialog">
        <p>You have unsaved changes</p>
        <button onClick={saveAndClose}>Save changes and close</button>
        <button onClick={throwAwayAndClose}>
          Throw away changes and close
        </button>
      </dialog>
      <div
        className={`resizer resizer-${position}`}
        onMouseDown={startResizing}
      ></div>
    </div>
  )
}

export const LxEditPanel: LxEditPanelType = (props) => {
  const container = useContext(LxPortalContext)
  if (!container) return null
  return createPortal(<LxEditPanelNoPortal {...props} />, container)
}
