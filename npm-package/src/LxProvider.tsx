import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  lazy,
  Suspense } from 'react'
import { getURLParameter } from './util'
import { ContentByLocale, LocaleCode, DEFAULT_LOCALE_CODE } from './Lexicon'
import { LexiconHub } from './editor/LexiconHub'

import './LxProviderStyles.css'

// 99.99% of sessions won't use editing - lazy load this chunk
const LazyLxEditPanel = lazy(
  () => import('./editor/LxEditPanel')
    .then(module => ({default: module.LxEditPanel}))
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
      "Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component."
    )
  }
  if (lexiconHub === NULL_CONTEXT) {
    throw new Error(
      "Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component."
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
  className = ""
}) => {
  //    STATE
  const [lexiconHub, setLexiconHub] = useState(emptyLexiconHub(localeCode))

  grabLexiconServerTokenAndReload()

  useEffect(() => {
    setLexiconHub(lexiconHub.locale(localeCode))
  }, [localeCode])

  //    RENDER
  return (
    <div className={`LxProvider ${className}`}>
      <LxContext.Provider value={lexiconHub}>
        {children}
        <EditButton
          lexiconHub={lexiconHub}
          setLexiconHub={setLexiconHub}
          apiUpdateUrl={apiUpdateUrl}
        />
      </LxContext.Provider>
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
}: {
  lexiconHub: LexiconHub
  setLexiconHub: (l: LexiconHub) => void
  apiUpdateUrl: string
}) => {
  //    State
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  //    Stateful Functions
  const toggleEditor = () => setIsEditorVisible(!isEditorVisible)

  //    Render
  if (isEditingBlocked()) return null

  return (
    <div className="EditButton">
      <div className="buttons">
        <button onClick={toggleEditor} className="edit-lexicon-btn">
          {isEditorVisible ? 'Hide Lexicon' : 'Edit Lexicon'}
        </button>
      </div>

      {isEditorVisible &&
        <Suspense fallback={null}>
          <LazyLxEditPanel
            visible={isEditorVisible}
            lexiconHub={lexiconHub}
            setLexiconHub={setLexiconHub}
            lexiconServerToken={getToken()}
            apiUpdateUrl={apiUpdateUrl}
            toggleEditPanel={toggleEditor}
          />
        </Suspense>
      }
    </div>
  )
}
