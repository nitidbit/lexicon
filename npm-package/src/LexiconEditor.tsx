import React, { useState, useEffect, useRef } from 'react';

import './LexiconEditorStyles.css';
import { Lexicon } from './Lexicon';
import { JSXElement } from '@babel/types';
import {KeyPath, KeyPathString, keyPathAsString} from './collection';

export type OnChangeCallback = (change: {
  filename: string,
  localPath: KeyPathString,
  updatePath: KeyPath,
  newValue: string}) => void;
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
  localPath: string;
  value: any;
  onChange: HtmlOnChangeCallback;
}

function Field({ localPath, value, onChange }: FieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (textareaRef.current && isExpanded) {
      adjustHeight();
    }
  }, [value, isExpanded]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.8;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(adjustHeight, 10);
  };

  return (
    <textarea
      ref={textareaRef}
      name={localPath}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      style={{
        height: isExpanded ? 'auto' : '1.5em',
        overflow: isExpanded ? 'auto' : 'hidden',
        transition: 'height 0.1s',
      }}
    />
  );
}

export interface LexiconEditorProps {
  lexicon: Lexicon;
  onChange: OnChangeCallback;
  selectedLocale: string;
  switchLocale: SwitchLocaleCallback;
}

export class LexiconEditor extends
  React.Component< LexiconEditorProps, {} > {

  sendLexiconEditorChange = (event) => {
    const { name: localPath, value: newValue } = event.target;
    const source = this.props.lexicon.source(localPath);
    const changeInfo = {
      filename: source.filename,
      localPath: keyPathAsString(source.localPath),
      updatePath: keyPathAsString(source.updatePath),
      newValue: newValue as string
    };
    this.props.onChange(changeInfo);
  }

  render() {
    return (
      <div id="LexiconEditor">

        <LocaleChooser lexicon={this.props.lexicon}
          selectedLocale={this.props.selectedLocale}
          switchLocale={this.props.switchLocale} />

        {
          this.props.lexicon.keys().map((key: string) => (
            <FormRow key={key} label={key}>
              <Field
                localPath={key}
                value={this.props.lexicon.get(key)}
                onChange={this.sendLexiconEditorChange}
              />
            </FormRow>
          ))
        }
      </div>
    );
  }
}
