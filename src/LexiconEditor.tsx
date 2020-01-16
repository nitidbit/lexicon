import React from 'react';

import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';
import { JSXElement } from '@babel/types';

export type ContentChangeCallback = (contentKey: string, newValue: string) => void;
export type SwitchLocaleCallback = (newLocale: string) => void;

type HtmlOnChangeCallback = (event: React.ChangeEvent<HTMLTextAreaElement>) => void;

function LocaleChooser({lexicon, switchLocale, selectedLocale}) {
  return (
    lexicon.locales().map((locale: string) => (
      <label htmlFor={`localeRadio__${locale}`} key={locale}>
        <input
          type="radio"
          id={`localeRadio__${locale}`}
          value={locale}
          checked={locale == selectedLocale}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => switchLocale(e.target.value)}
        />
        {locale}
      </label>
    ))
  );
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

interface FieldProps {
  contentKey: string;
  value: any;
  onChange: HtmlOnChangeCallback;
}

const Field = ({ contentKey, value, onChange }: FieldProps) => (
  <textarea
    name={contentKey}
    value={value}
    onChange={onChange}
  />
);

export interface LexiconEditorProps {
  lexicon: Lexicon;
  onChange: ContentChangeCallback;
  selectedLocale: string;
  switchLocale: SwitchLocaleCallback;
}

export const LexiconEditor = ({ lexicon, onChange, selectedLocale, switchLocale }: LexiconEditorProps) => {
  const sendLexiconEditorChange = (event) => {
    const { name: contentKey, value: newValue } = event.target;
    onChange(contentKey, newValue);
  };

  return (
    <div id="LexiconEditor">

      <LocaleChooser lexicon={lexicon} selectedLocale={selectedLocale} switchLocale={switchLocale} />

      {
        lexicon.keys().map((key: string) => (
          <FormRow key={key} label={key}>
            <Field
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

