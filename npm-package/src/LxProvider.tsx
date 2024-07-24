import React, { useState, createContext, useContext } from 'react';
import { LxEditControl } from './LxEditControl'
import { Lexicon, ContentByLocale, LocaleCode, DEFAULT_LOCALE_CODE } from './Lexicon'
import { LexiconHub } from './LexiconHub'

const EMPTY_LEXICON_HUB = new LexiconHub({repoPath: 'SHARED LEXICON', en: {}, es: {}})

const LxContext = createContext(EMPTY_LEXICON_HUB)

// Finds or creates a lexicon for your content. Also registers it with LexiconHub so it will appear
// in editor.
export const useLexicon = (
  contentByLocale: ContentByLocale,
  localeCode: LocaleCode = DEFAULT_LOCALE_CODE
) => {
  const lexiconHub = useContext(LxContext)
  return lexiconHub.register(contentByLocale, localeCode)
}

// Place this ContextProvider around your app to allow inner components to access
// the shared root lexicon, and also the editor
export const LxProvider = ({apiUpdateUrl, children}) => {
  const [lexiconHub, setLexiconHub] = useState(EMPTY_LEXICON_HUB)

  const setLexcionHub2 = (newHub) => {
    setLexiconHub(newHub)
  }

  return (
    <div className="LxProvider">
      <LxContext.Provider value={ lexiconHub }>
        { children }
        <LxEditControl
          lexiconHub={lexiconHub}
          setLexiconHub={setLexiconHub}
          apiUpdateUrl={apiUpdateUrl}
        />
      </LxContext.Provider>
    </div>
  )
}

