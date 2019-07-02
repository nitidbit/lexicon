import React from 'react';
import {LexiconShape} from './Lexicon';
import LexiconEditor from './LexiconEditor';
import _ from 'lodash';
import axios from 'axios';
import '../styles/EditWrapperStyles.scss';

type EditWrapperProps = {
  component: React.FunctionComponent<{ lexicon: any }> | React.ComponentClass<{ lexicon: any }, any>,
  lexicon: any,
  lexiconShape: LexiconShape,
  allowEditing?: boolean,
  apiUpdateUrl: string,
  apiToken?: string,
};

type EditWrapperState = {
  isEditorVisible: boolean,
  lexicon: any,
  isSaving: boolean,
  unsavedChanges: {
    filename: string,
    key: string,
    newValue: string,
  }[],
  errorMessage?: string,
  justSaved: boolean,
};

class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
  constructor(props: EditWrapperProps) {
    super(props);

    this.state = {
      lexicon: props.lexiconShape.extract(props.lexicon),
      isEditorVisible: false,
      isSaving: false,
      unsavedChanges: [],
      justSaved: false,
    };
  }

  getToken(): string {
    if (this.props.hasOwnProperty('apiToken')) {
      return this.props.apiToken;
    } else {
      return localStorage.lexiconEditorToken;
    }
  }

  allowEditing(): boolean {
    if (this.props.hasOwnProperty('allowEditing')) {
      return this.props.allowEditing;
    } else {
      return localStorage.hasOwnProperty('lexiconEditorToken');
    }
  }

  toggleEditor = () => {
    this.setState((prevState: EditWrapperState) => ({
      isEditorVisible: ! prevState.isEditorVisible
    }));
  }

  render() {
    if (this.allowEditing()) {
      return (
        <div className="EditWrapper">
          {React.createElement(this.props.component, { lexicon: this.state.lexicon }, this.props.children)}
          <button onClick={this.toggleEditor} className="edit-wrapper-button">
            { this.state.isEditorVisible ? 'Hide Editor' : 'Edit Content' }
          </button>

          <div className={'wrapped-lexicon-editor' + (this.state.isEditorVisible ? ' is-visible' : '')}>
            <LexiconEditor
              flatShape={this.props.lexiconShape.flatShape(this.props.lexiconShape)}
              lexicon={this.state.lexicon}
              onChange={this.updateText}
            />

            { this.state.errorMessage &&
              <div>
                {this.state.errorMessage}
              </div>
            }

            <button onClick={this.saveChanges} disabled={ this.state.unsavedChanges.length === 0 || this.state.isSaving } className="edit-wrapper-button">
              Save Changes
            </button>
            {this.state.isSaving && 'Saving...'}
            {this.state.justSaved && 'Saved!'}
          </div>
        </div>
      );
    }

    return React.createElement(this.props.component, { lexicon: this.state.lexicon }, this.props.children);
  }

  updateText = (contentKey: string, newValue: string) => {
    this.setState(oldState => {
      let newState: EditWrapperState = Object.assign({}, oldState);
      _.set(newState, `lexicon.${contentKey}`, newValue );
      newState.justSaved = false;
      newState.unsavedChanges = [...oldState.unsavedChanges];

      const [filename, key] = this.props.lexiconShape.fileAndKeyFor(contentKey);
      if (filename === undefined) {
        throw new Error(`No filename provided on ${this.props.lexiconShape}!`);
      }
      const index = oldState.unsavedChanges.findIndex(c => (c.filename === filename && c.key === key));
      if (index >= 0) {
        newState.unsavedChanges[index].newValue = newValue;
      } else {
        newState.unsavedChanges.push({ filename, key, newValue });
      }

      return newState;
    });
  }

  saveChanges = () => {
    this.setState({ isSaving: true });
    axios.put(this.props.apiUpdateUrl, { changes: this.state.unsavedChanges },
      {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      }
    )
      .then(() => {
        this.setState({ isSaving: false, unsavedChanges: [], errorMessage: undefined, justSaved: true });
      })
      .catch(error => {
        console.error(error);
        this.setState({ isSaving: false, justSaved: false });

        if (error.response) {
          this.setState({ errorMessage: error.response.data });
        } else if (error.request) {
          this.setState({ errorMessage: 'No response from server' });
        } else {
          this.setState({ errorMessage: error.message });
        }
      });
  }
}

export default EditWrapper;
