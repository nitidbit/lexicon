import React, { ChangeEvent } from 'react';

import { Lexicon } from './Lexicon';
import LexiconEditor from './LexiconEditor';
import '../styles/EditWrapperStyles.scss';

interface EditWrapperProps {
  lexicon: Lexicon;
  component?: React.FunctionComponent<{ lexicon: Lexicon }> | React.ComponentClass<{ lexicon: Lexicon }>;
  allowEditing?: boolean;
  apiToken?: string;
  apiUpdateUrl: string;
  extraHeaders?: { [header: string]: string };
  OptionalLogoutButton?: React.FC<any>
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
}

interface LexiconAPIResponse {
  successful: boolean;
  error: string | null;
};

export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
  constructor(props: EditWrapperProps) {
    super(props);

    this.state = {
      isEditorVisible: false,
      lexicon: props.lexicon,
      unsavedChanges: new Map(),
      savingState: SavingState.NoChanges,
      position: 'left',
    };
  }

  toggleEditor = () => {
    this.setState({ ...this.state, isEditorVisible: !this.state.isEditorVisible });
  }

  getToken(): string {
    if ('apiToken' in this.props) {
      return this.props.apiToken;
    } else {
      return localStorage.lexiconEditorToken;
    }
  }

  allowEditing(): boolean {
    if ('allowEditing' in this.props) {
      return this.props.allowEditing;
    } else {
      return localStorage.hasOwnProperty('lexiconEditorToken');
    }
  }

  updateText = (contentKey: string, newValue: string) => {
    this.setState(oldState => {
      const newLexicon = oldState.lexicon.clone();
      newLexicon.update(contentKey, newValue);

      const newChanges = new Map(oldState.unsavedChanges),
        fullPath = `${oldState.lexicon.defaultLocale}.${contentKey}`;
      if (newChanges.has(fullPath)) {
        if (newChanges.get(fullPath).originalValue == newValue) {
          newChanges.delete(fullPath);
        } else {
          const originalValue = newChanges.get(fullPath).originalValue;
          newChanges.set(fullPath, { originalValue, newValue });
        }
      } else {
        newChanges.set(fullPath, { originalValue: oldState.lexicon.get(contentKey), newValue });
      }

      return { lexicon: newLexicon, unsavedChanges: newChanges, savingState: newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available };
    });
  }

  switchLocale = (newLocale: string) => {
    this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
  }

  saveChanges = () => {
    this.setState({ savingState: SavingState.InProgress });

    const fetchOptions: RequestInit = {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
        ...this.props.extraHeaders,
      },
      body: JSON.stringify({
        changes: [...this.state.unsavedChanges.entries()].map(([key, { newValue }]) => ({
          filename: this.state.lexicon.filename,
          key,
          newValue,
        })),
      }),
    };

    fetch(this.props.apiUpdateUrl, fetchOptions)
      .then(response => response.json())
      .catch(error => this.setState({ savingState: SavingState.Error, errorMessage: error.toString() }))
      .then((json: LexiconAPIResponse) => {
        if (json.successful) {
          this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
        } else {
          this.setState({ savingState: SavingState.Error, errorMessage: json.error });
        }
      });
  }

  changePosition = (e: React.MouseEvent<HTMLInputElement>) => {
    const newPos = (e.target as HTMLInputElement).name;

    if (newPos == 'left' || newPos == 'bottom' || newPos == 'right') {
      this.setState({ position: newPos });
    }
  }

  render() {
    const { component, children, OptionalLogoutButton } = this.props,
      { isEditorVisible, lexicon } = this.state;

    if (this.allowEditing()) {
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

      return (
        <div className="EditWrapper">
          { /* User's component with an "Edit Content" button */ }
          { component && React.createElement(component, { lexicon }, children)}
          <div className='buttons'>
            <button onClick={this.toggleEditor} className="edit-wrapper-button">
              { isEditorVisible ? 'Hide Editor' : 'Edit Content' }
            </button>
            { OptionalLogoutButton && <OptionalLogoutButton /> }
          </div>

          { /* Content Editor on the side */ }
          <div className={`wrapped-lexicon-editor docked-${this.state.position}${this.state.isEditorVisible ? ' is-visible' : ''}`}>
            <hgroup>
              <h2 className="wrapper-heading">Content Editor</h2>

              <div className="position">
                {
                  [ ['left', '\u25e7'],
                    ['bottom', '\u2b13'],
                    ['right', '\u25e8']].map(([pos, icon]) => (
                    <label className={this.state.position == pos ? 'selected' : ''}>{icon}
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
              onChange={this.updateText}
              selectedLocale={lexicon.defaultLocale}
              switchLocale={this.switchLocale}
            />
            <div className="save-box">
              <button onClick={this.saveChanges} disabled={ !buttonEnabled }>
                {buttonText}
              </button>
            </div>
            { this.state.savingState == SavingState.Error && <p className="error-message">{this.state.errorMessage}</p> }
          </div>
        </div>
      );
    }

    return React.createElement(component, { lexicon }, children);
  }
}
