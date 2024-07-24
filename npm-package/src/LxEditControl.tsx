/*
    React Component which will:
    - render nothing in normal operation
    - renders an Edit Lexicon button when a LexiconServerToken is present, i.e. they
      users has come from Lexicon Server and is editing
*/

import React, { useState } from 'react';
import { getURLParameter } from './util';
import * as col from './collection'
import { LexiconHub } from "./LexiconHub"
import { LxEditPanel } from "./LxEditPanel"


/*
    If URL has ?lexiconServerToken=___, then store it, reload, and show the editing buttons
*/
const grabLexiconServerTokenAndReload = () => {
  let lexiconServerToken = getURLParameter('lexiconServerToken')
  if (lexiconServerToken) {
    sessionStorage.setItem('lexiconServerToken', lexiconServerToken); // Save token

    // Reload to remove token from URL
    let locationWithoutToken = window.location.href.split("?")[0];
    window.history.replaceState(null, null, locationWithoutToken);

    if (document.location.protocol != 'https:') {
      console.warn('You should use HTTPS otherwise the lexiconServerToken is passed insecurely');
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
export const LxEditControl = ({
  lexiconHub,
  setLexiconHub,
  apiUpdateUrl,
}:{
  lexiconHub: LexiconHub,
  setLexiconHub: (l: LexiconHub) => void,
  apiUpdateUrl: string
}) => {

  //
  //    State
  //

  const [isEditorVisible, setIsEditorVisible] = useState(false)

  //
  //    Stateful Functions
  //

  const toggleEditor = () => setIsEditorVisible( !isEditorVisible )


  //
  //    Render
  //
  if (isEditingBlocked()) return null

  return (
    <div className="LxEditControl">
      <div className='buttons'>
        <button onClick={toggleEditor} className="edit-wrapper-button">
          { isEditorVisible ? 'Hide Lexicon' : 'Edit Lexicon' }
        </button>
      </div>

      <LxEditPanel
        visible={isEditorVisible}
        lexiconHub={lexiconHub}
        setLexiconHub={setLexiconHub}
        lexiconServerToken={getToken()}
        apiUpdateUrl={apiUpdateUrl}
        toggleEditPanel={toggleEditor}
      />
    </div>
  )
}

