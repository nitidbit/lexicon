import React, { ChangeEvent } from 'react';
import lodash_fp from 'lodash/fp'
import { Lexicon } from '../Lexicon';
import { VERSION } from '../index';
import { LexiconEditor, OnChangeCallback } from './LexiconEditor';
import { getURLParameter } from '../util';
import { KeyPath, KeyPathString } from '../collection';

import './EditWrapperStyles.css';

interface EditWrapperProps {
  component:                                                    // This is the React component rendered inside the wrapper.
    React.FunctionComponent<{ lexicon: Lexicon }>               // You can pass just a React Class component
    | React.ComponentClass<{ lexicon: Lexicon }>                // or a React function
    | [React.FunctionComponent<{ lexicon: Lexicon }>, Object]   // or a [Component, {with: extra_props}]
    | [React.ComponentClass<{ lexicon: Lexicon }>, Object]
    ;
  lexicon: Lexicon;
  apiUpdateUrl: string;
  allowEditing?: boolean;
  apiToken?: string;
  extraHeaders?: { [header: string]: string };
  OptionalLogoutButton?: React.FC<any>;
  children?: any;
}

type EditWrapperChanges = Map<string, { originalValue: string, newValue: string }>;

enum SavingState {
  NoChanges,
  Available,
  InProgress,
  Done,
  Error,
}

interface EditWrapperState {
  isEditorVisible: boolean;
  lexicon: Lexicon;
  unsavedChanges: EditWrapperChanges;
  savingState: SavingState;
  errorMessage?: string;
  position: 'left' | 'bottom' | 'right';
  editorWidth: number;
  editorHeight: number;
}

interface LexiconAPIResponse {
  successful: boolean;
  error: string | null;
};

/*
    Deprecated -- use <LxProvider> instead. See README.md for how to use it.
 */
export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
  constructor(props: EditWrapperProps) {
    super(props);

    if (! (props.lexicon as any instanceof Lexicon)) throw new Error(`'lexicon' prop should be a Lexicon object, but it is: ${JSON.stringify(props.lexicon).substring(0,50)}`)

    this.grabLexiconServerTokenAndReload()

    this.state = {
      isEditorVisible: false,
      lexicon: props.lexicon,
      unsavedChanges: new Map(),
      savingState: SavingState.NoChanges,
      position: 'left',
      editorWidth: undefined,
      editorHeight: undefined,
    };
  }

  // If URL has ?lexiconServerToken=___, then store it, reload, and show the editing buttons
  grabLexiconServerTokenAndReload() {
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

  toggleEditor = () => {
    this.setState({ ...this.state, isEditorVisible: !this.state.isEditorVisible });
  }

  getToken(): string {
    if ('apiToken' in this.props) {
      return this.props.apiToken;
    } else {
      return sessionStorage.lexiconServerToken;
    }
  }

  allowEditing(): boolean {
    let result;
    if ('allowEditing' in this.props) {
      result = this.props.allowEditing;
    } else {
      result = sessionStorage.hasOwnProperty('lexiconServerToken');
    }
    return result;
  }

  updateTextFromEditor:OnChangeCallback = (change) => {
    this.setState(oldState => {
      const newLexicon = lodash_fp.set(change.updatePath, change.newValue, oldState.lexicon)

      const fileKey = JSON.stringify({
        filename: change.filename,
        localPath: change.localPath
      }); // we stringify here because Javascript never treats multiple objects as the same one even if the keys and values are all identical

      const existingChange = oldState.unsavedChanges.get(fileKey)
      let originalValue = existingChange && existingChange.originalValue;

      const newChanges = new Map(oldState.unsavedChanges);
      if (originalValue == change.newValue) {
          newChanges.delete(fileKey); // They changed it back to original value--no net change
      } else {
        originalValue = originalValue || oldState.lexicon.getExact(change.localPath.slice(3)); // the slice trims off locale aka 'en.'
        newChanges.set(fileKey, { originalValue, newValue: change.newValue });
      }

      return {
        lexicon: newLexicon,
        unsavedChanges: newChanges,
        savingState: newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available,
      };
    });
  }

  switchLocale = (newLocale: string) => {
    this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
  }

  saveChanges = () => {
    this.setState({ savingState: SavingState.InProgress });

    const headers = {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
      ...this.props.extraHeaders };
    const listOfChanges = [...this.state.unsavedChanges.entries()].map(([fileKeyString, { newValue }]) => {
        const fileKey = JSON.parse(fileKeyString);

        return {
          filename: fileKey.filename,
          key: fileKey.localPath,
          newValue,
        }
      })
    const payload = { changes: listOfChanges };

    fetch(this.props.apiUpdateUrl, {
      method: 'PUT',
      mode: 'cors',
      headers: headers,
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then((json: LexiconAPIResponse) => {
        if (json.successful) {
          this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
        } else {
          this.setState({ savingState: SavingState.Error, errorMessage: json.error });
        }
      })
      .catch(error => this.setState({ savingState: SavingState.Error, errorMessage: error.toString() }))
  }

  changePosition = (e: React.MouseEvent<HTMLInputElement>) => {
    const newPos = e.currentTarget.name;

    if ((newPos === 'left' || newPos === 'right') && this.state.position !== 'bottom') {
      const currentWidth = this.state.editorWidth;
      this.setState({
        position: newPos,
        editorWidth: currentWidth,
      });
    } else if ((newPos === 'left' || newPos === 'right') && this.state.position === 'bottom') {
      this.setState({
        position: newPos,
        editorHeight: undefined,
      });
    } else if (newPos === 'bottom' && (this.state.position === 'left' || this.state.position === 'right')) {
      this.setState({
        position: newPos,
        editorWidth: undefined,
      });
    }
  }

  startResizing = (e: React.MouseEvent) => {
    window.addEventListener('mousemove', this.resize);
    window.addEventListener('mouseup', this.stopResizing);
  }

  resize = (e: MouseEvent) => {
    const { position } = this.state;

    if (position === 'right') {
      this.setState({ editorWidth: window.innerWidth - e.clientX });
    } else if (position === 'left') {
      this.setState({ editorWidth: e.clientX });
    } else if (position === 'bottom') {
      this.setState({ editorHeight: window.innerHeight - e.clientY });
    }
  }

  stopResizing = () => {
    window.removeEventListener('mousemove', this.resize);
    window.removeEventListener('mouseup', this.stopResizing);
  }

  render() {
    const { component, children, OptionalLogoutButton } = this.props,
      { isEditorVisible, lexicon, editorWidth, editorHeight } = this.state;

    // Did the caller pass just a component, or a [component, {with: props}]?
    let renderedComponent = null;
    let renderedComponentProps = {};
    if (Array.isArray(component)) {
      renderedComponent = component[0];
      renderedComponentProps = component[1];
    } else {
      renderedComponent = component;
    }

    if (!this.allowEditing()) {
      return React.createElement(renderedComponent, { lexicon, ...renderedComponentProps }, children);

    } else {
      let buttonText: string, buttonEnabled: boolean;

      switch (this.state.savingState) {
        case SavingState.NoChanges:
          buttonText = 'Nothing to Save';
          buttonEnabled = false;
          break;
        case SavingState.Available:
          buttonText = 'Save changes';
          buttonEnabled = true;
          break;
        case SavingState.InProgress:
          buttonText = 'Saving...';
          buttonEnabled = false;
          break;
        case SavingState.Done:
          buttonText = 'Saved!';
          buttonEnabled = false;
          break;
        case SavingState.Error:
          buttonText = 'Save changes';
          buttonEnabled = true;
          break;
      }

      // Did the caller pass just a component, or a [component, {with: props}]?
      let renderedComponent = null;
      let renderedComponentProps = {};
      if (Array.isArray(component)) {
        renderedComponent = component[0];
        renderedComponentProps = component[1];
      } else {
        renderedComponent = component;
      }

      return (
        <div className="EditWrapper">
          { /* User's component with an "Edit Content" button */ }

          { React.createElement(renderedComponent, { lexicon, ...renderedComponentProps }, children)}

          <div className='buttons'>
            <button onClick={this.toggleEditor} className="edit-wrapper-button">
              { isEditorVisible ? 'Hide Lexicon' : 'Edit Lexicon' }
            </button>
            { OptionalLogoutButton && <OptionalLogoutButton /> }
          </div>

          { /* Content Editor on the side */ }
          <div
            className={`wrapped-lexicon-editor docked-${this.state.position}${this.state.isEditorVisible ? ' is-visible' : ''}`}
            style={{ width: editorWidth, height: editorHeight }}
          >
            <hgroup>
              <h2 className="wrapper-heading">Lexicon</h2>

              <div className="position">
                {
                  [ ['left', '\u25e7'],
                    ['bottom', '\u2b13'],
                    ['right', '\u25e8']].map(([pos, icon]) => (
                    <label key={pos} className={this.state.position == pos ? 'selected' : ''}>{icon}
                      <input type="radio" name={pos} onClick={this.changePosition} />
                    </label>
                  ))
                }
              </div>
              <label className="close-btn"> &times;
                <button onClick={this.toggleEditor}/>
              </label>
          </hgroup>

            <LexiconEditor
              lexicon={lexicon}
              onChange={this.updateTextFromEditor}
              selectedLocale={lexicon.currentLocaleCode}
              switchLocale={this.switchLocale}
              toggleEditor={this.toggleEditor}
              visible={isEditorVisible}
            />
            <div className="save-box">
              <span> v{VERSION} </span>
              <button onClick={this.saveChanges} disabled={ !buttonEnabled }>
                {buttonText}
              </button>
            </div>
            { this.state.savingState == SavingState.Error && <p className="error-message">{this.state.errorMessage}</p> }
            <div className={`resizer resizer-${this.state.position}`} onMouseDown={this.startResizing}></div>
          </div>
        </div>
      );
    }
  }
}

