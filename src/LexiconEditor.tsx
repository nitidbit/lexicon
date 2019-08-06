import React from 'react';

import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';

export type ContentOnChangeCallback = (contentKey: string, newValue: any) => void;

type HtmlOnChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) => void;

interface EditorProps {
  contentKey: string;
  value: any;
  onChange: HtmlOnChangeCallback;
}

const FormRow = (props: { label: string, children: any }) => (
  <div id="FormRow">
    <label title={props.label}>
      <span className="label">
        {props.label}
      </span>
      {props.children}
    </label>
  </div>
);

const ShortString = ({ contentKey, value, onChange }: EditorProps) => (
  <input
    type="text"
    id="ShortString"
    name={contentKey}
    defaultValue={value}
    onChange={onChange}
  />
);

const LexiconEditor = ({ lexicon, onChange }: { lexicon: Lexicon, onChange: ContentOnChangeCallback }) => {
  const sendLexiconEditorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: contentKey, value: newValue } = event.target;
    onChange(contentKey, newValue);
  };

  return (
    <div id="LexiconEditor">
      <h2>Content Editor</h2>
      {
        lexicon.keys().map((key: string) => (
          <FormRow key={key} label={key}>
            <ShortString
              contentKey={key}
              value={lexicon.get(key)}
              onChange={sendLexiconEditorChange}
            />
          </FormRow>
        ))
      }
    </div>
  );
};

export default LexiconEditor;
