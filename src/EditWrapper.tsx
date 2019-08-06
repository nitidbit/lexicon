import React from 'react';

import { Lexicon } from './Lexicon';
import LexiconEditor from './LexiconEditor';
import '../styles/EditWrapperStyles.scss';

interface EditWrapperProps {
  component: React.FunctionComponent<{ lexicon: Lexicon }> | React.ComponentClass<{ lexicon: Lexicon }>;
  lexicon: Lexicon;
  allowEditing?: boolean;
}

interface EditWrapperState {
  isEditorVisible: boolean;
  lexicon: Lexicon;
}

export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
  constructor(props: EditWrapperProps) {
    super(props);

    this.state = {
      isEditorVisible: false,
      lexicon: props.lexicon,
    };
  }

  toggleEditor = () => {
    this.setState({ ...this.state, isEditorVisible: !this.state.isEditorVisible });
  }

  allowEditing() {
    return true;
  }

  updateText = (contentKey: string, newValue: string) => {
    this.setState(oldState => {
      const newLexicon = oldState.lexicon.clone();
      newLexicon.update(contentKey, newValue);
      return { lexicon: newLexicon };
    });
  }

  switchLocale = (newLocale: string) => {
    this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
  }

  render() {
    const { component, children } = this.props,
      { isEditorVisible, lexicon } = this.state;

    if (this.allowEditing()) {
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
          </div>
        </div>
      );
    }

    return React.createElement(component, { lexicon }, children);
  }
}
