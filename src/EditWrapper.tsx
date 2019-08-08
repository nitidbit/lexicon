import React from 'react';

import { Lexicon } from './Lexicon';
import LexiconEditor from './LexiconEditor';
import '../styles/EditWrapperStyles.scss';

interface EditWrapperProps {
  component: React.FunctionComponent<{ lexicon: Lexicon }> | React.ComponentClass<{ lexicon: Lexicon }>;
  lexicon: Lexicon;
  allowEditing?: boolean;
  apiToken?: string;
  apiUpdateUrl: string;
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

  saveChanges = async () => {
    this.setState({ savingState: SavingState.InProgress });

    const fetchOptions: RequestInit = {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changes: [...this.state.unsavedChanges.entries()].map(([key, { newValue }]) => ({
          filename: this.state.lexicon.filename,
          key,
          newValue,
        })),
      }),
    };

    try {
      const response = await fetch(this.props.apiUpdateUrl, fetchOptions);
      const json = (await response.json()) as LexiconAPIResponse;
      if (json.successful) {
        this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
      } else {
        this.setState({ savingState: SavingState.Error, errorMessage: json.error });
      }
    } catch(e) {
      this.setState({ savingState: SavingState.Error, errorMessage: e.toString() });
    }
  }

  render() {
    const { component, children } = this.props,
      { isEditorVisible, lexicon } = this.state;

    if (this.allowEditing()) {
      let buttonText: string, buttonEnabled: boolean;

      switch (this.state.savingState) {
        case SavingState.NoChanges:
          buttonText = 'Save changes';
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
          {React.createElement(component, { lexicon }, children)}
          <button onClick={this.toggleEditor} className="edit-wrapper-button">
            { isEditorVisible ? 'Hide Editor' : 'Edit Content' }
          </button>

          <div className={`wrapped-lexicon-editor${this.state.isEditorVisible ? ' is-visible' : ''}`}>
            <LexiconEditor
              lexicon={lexicon}
              onChange={this.updateText}
              selectedLocale={lexicon.defaultLocale}
              switchLocale={this.switchLocale}
            />
            <button onClick={this.saveChanges} disabled={ !buttonEnabled }>
              {buttonText}
            </button>
            { this.state.savingState == SavingState.Error && <p>{this.state.errorMessage}</p> }
          </div>
        </div>
      );
    }

    return React.createElement(component, { lexicon }, children);
  }
}
