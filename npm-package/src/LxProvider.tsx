import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  lazy,
  Suspense,
  useId,
  useRef,
} from 'react'
import {
  setActiveEditor,
  getActiveEditorId,
  useActiveEditorSubscription,
} from './activeEditorStore'
import { getURLParameter } from './util'
import { ContentByLocale, LocaleCode, DEFAULT_LOCALE_CODE } from './Lexicon'
import { LexiconHub } from './editor/LexiconHub'
import { LxPortalContext } from './LxPortalContext'

import './LxProviderStyles.css'

// 99.99% of sessions won't use editing - lazy load this chunk
const LazyLxEditPanel = lazy(() =>
  import('./editor/LxEditPanel').then((module) => ({
    default: module.LxEditPanel,
  }))
)

let nextProviderNum = 1
const emptyLexiconHub = (localeCode: string = '') => {
  return new LexiconHub(
    { repoPath: `LEXICON HUB ${nextProviderNum++}`, en: {}, es: {} },
    localeCode
  )
}

const NULL_CONTEXT = null
const LxContext = createContext(NULL_CONTEXT)

// Finds or creates a lexicon for your content. Also registers it with LexiconHub so it will appear
// in editor.
export const useLexicon = (
  contentByLocale: ContentByLocale,
  localeCode: LocaleCode = null
) => {
  let lexiconHub: LexiconHub
  try {
    lexiconHub = useContext(LxContext)
  } catch (error) {
    throw new Error(
      'Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component.'
    )
  }
  if (lexiconHub === NULL_CONTEXT) {
    throw new Error(
      'Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component.'
    )
  }
  return lexiconHub.register(contentByLocale, localeCode)
}

// Place this ContextProvider around your app to allow inner components to access
// the shared root lexicon, and also the editor
export const LxProvider = ({
  apiUpdateUrl,
  children,
  localeCode = DEFAULT_LOCALE_CODE,
  className = '',
  lexiconNameToDisplay = 'Lexicon',
  editPanelExcludeLexicons,
}: {
  apiUpdateUrl?: string
  children: React.ReactNode
  localeCode?: string
  className?: string
  lexiconNameToDisplay?: string
  editPanelExcludeLexicons?: string[]
}) => {
  //    STATE
  const [lexiconHub, setLexiconHub] = useState(emptyLexiconHub(localeCode))
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null)

  grabLexiconServerTokenAndReload()

  useEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('data-nitid-lexicon-portal', '')
    document.body.appendChild(el)
    setPortalEl(el)
    return () => {
      el.remove()
      setPortalEl(null)
    }
  }, [])

  useEffect(() => {
    setLexiconHub((prev) => prev.locale(localeCode) ?? prev)
  }, [localeCode])

  //    RENDER
  return (
    <div className={`LxProvider ${className}`}>
      <LxPortalContext.Provider value={portalEl}>
        <LxContext.Provider value={lexiconHub}>
          {children}
          <EditButton
            lexiconHub={lexiconHub}
            setLexiconHub={setLexiconHub}
            apiUpdateUrl={apiUpdateUrl}
            lexiconNameToDisplay={lexiconNameToDisplay}
            editPanelExcludeLexicons={editPanelExcludeLexicons}
          />
        </LxContext.Provider>
      </LxPortalContext.Provider>
    </div>
  )
}

//
//      INTERNAL STUFF
//

/*
    If URL has ?lexiconServerToken=___, then store it, reload, and show the editing buttons
*/
const grabLexiconServerTokenAndReload = () => {
  let lexiconServerToken = getURLParameter('lexiconServerToken')
  if (lexiconServerToken) {
    sessionStorage.setItem('lexiconServerToken', lexiconServerToken) // Save token

    // Reload to remove token from URL
    let locationWithoutToken = window.location.href.split('?')[0]
    window.history.replaceState(null, null, locationWithoutToken)

    if (document.location.protocol != 'https:') {
      console.warn(
        'You should use HTTPS otherwise the lexiconServerToken is passed insecurely'
      )
    }
  }
}

/* Return server token if any */
const getToken = () => sessionStorage.lexiconServerToken

/* Should we enable editing functionality? */
const isEditingBlocked = () => !getToken()

/*
    Renders Edit Lexicon button if in editing mode
*/
export const EditButton = ({
  lexiconHub,
  setLexiconHub,
  apiUpdateUrl,
  lexiconNameToDisplay,
  editPanelExcludeLexicons,
}: {
  lexiconHub: LexiconHub
  setLexiconHub: (l: LexiconHub) => void
  apiUpdateUrl: string
  lexiconNameToDisplay: string
  editPanelExcludeLexicons?: string[]
}) => {
  //    State
  const [isEditorVisible, setIsEditorVisible] = useState(false)
  const myId = useRef(useId()).current
  const editPanelRef = useRef<{ requestClose: () => void } | null>(null)
  useActiveEditorSubscription()

  const activeEditorId = getActiveEditorId()
  const isDisabled = activeEditorId !== null && activeEditorId !== myId

  //    Stateful Functions
  const toggleEditor = () => {
    const nextVisible = !isEditorVisible
    setIsEditorVisible(nextVisible)
    setActiveEditor(nextVisible ? myId : null)
  }

  const handleEditLexiconButtonClick = () => {
    if (isEditorVisible) {
      editPanelRef.current?.requestClose()
    } else {
      toggleEditor()
    }
  }

  useEffect(() => {
    return () => {
      if (getActiveEditorId() === myId) {
        setActiveEditor(null)
      }
    }
  }, [myId])

  //    Render
  if (isEditingBlocked()) return null

  return (
    <div className="EditButton">
      <div className="buttons">
        <button
          onClick={handleEditLexiconButtonClick}
          className="edit-lexicon-btn"
          disabled={isDisabled}
          data-tooltip={
            isDisabled
              ? 'Disabled because you opened editor with another button'
              : undefined
          }
        >
          {isEditorVisible
            ? `Hide ${lexiconNameToDisplay}`
            : `Edit ${lexiconNameToDisplay}`}
        </button>
      </div>

      {isEditorVisible && (
        <Suspense fallback={null}>
          <LazyLxEditPanel
            panelApiRef={editPanelRef}
            visible={isEditorVisible}
            lexiconHub={lexiconHub}
            setLexiconHub={setLexiconHub}
            lexiconServerToken={getToken()}
            apiUpdateUrl={apiUpdateUrl}
            toggleEditPanel={toggleEditor}
            lexiconNameToDisplay={lexiconNameToDisplay}
            editPanelExcludeLexicons={editPanelExcludeLexicons}
          />
        </Suspense>
      )}
    </div>
  )
}
