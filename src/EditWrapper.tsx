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
}

export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
  constructor(props: EditWrapperProps) {
    super(props);

    this.state = {
      isEditorVisible: false,
    };
  }

  toggleEditor = () => {
    this.setState({ ...this.state, isEditorVisible: !this.state.isEditorVisible });
  }

  allowEditing() {
    return true;
  }

  updateText() {}

  render() {
    const { component, lexicon, children } = this.props,
      { isEditorVisible } = this.state;

    if (this.allowEditing()) {
      return (
        <div className="EditWrapper">
          {React.createElement(component, { lexicon }, children)}
          <button onClick={this.toggleEditor} className="edit-wrapper-button">
            { isEditorVisible ? 'HideEditor' : 'Edit Content' }
          </button>

          <div className={`wrapped-lexicon-editor${this.state.isEditorVisible ? ' is-visible' : ''}`}>
            <LexiconEditor
              lexicon={lexicon}
              onChange={this.updateText}
            />
          </div>
        </div>
      );
    }

    return React.createElement(component, { lexicon }, children);
  }
}
