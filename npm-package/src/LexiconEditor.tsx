import React, { useState, useEffect, useRef } from 'react';

import './LexiconEditorStyles.css';
import { Lexicon } from './Lexicon';
import { JSXElement } from '@babel/types';
import {KeyPath, KeyPathString, keyPathAsString} from './collection';

const expandedStyle = (isExpanded=true) => {
                        return {
                                height: isExpanded ? 'auto' : '1.5em',
                                overflow: isExpanded ? 'auto' : 'hidden',
                                transition: 'height 0.1s',
                                background : isExpanded ? '#ffffdd' : '',
                                border: isExpanded ? '2px solid #0000ff' : 'none'
                               }
                      }

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
  justClickedElement: string;
}

function Field({ localPath, value, onChange, justClickedElement }: FieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (justClickedElement === localPath) {
      setIsExpanded(true)
    }
    if (textareaRef.current && isExpanded) {
      adjustHeight();
    }
  }, [value, isExpanded, justClickedElement]);


  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.8;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
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
      id={localPath}
      value={value}
      onChange={handleChange}
      style={expandedStyle(isExpanded)}
    />
  );
}

export interface LexiconEditorProps {
  lexicon: Lexicon;
  onChange: OnChangeCallback;
  selectedLocale: string;
  switchLocale: SwitchLocaleCallback;
  toggleEditor: () => void;
}

export class LexiconEditor extends
  React.Component< LexiconEditorProps, { justClickedElement: string} > {

  constructor(props) {
    super(props);
    this.state = { justClickedElement: '',}
  }
  
  setJustClickedElement = (value: string) => this.setState({justClickedElement: value});

  componentDidMount() {
    const all = document.getElementsByTagName("*");
    Array.from(all).forEach((element) => {
      const htmlElement = element as HTMLElement
      if (htmlElement.getAttribute("data-lexicon")) {
        const oldBackground = htmlElement.style.background
        htmlElement.addEventListener("click", (e) => {
          if (e.altKey && e.shiftKey) {
            const htmlTarget = e.target as HTMLElement
            const lexiconAttribute = htmlTarget.getAttribute("data-lexicon")
            const lexiconElement = document.getElementById(lexiconAttribute)
            this.props.toggleEditor()
            lexiconElement.scrollIntoView()
            this.setJustClickedElement(lexiconAttribute)
            htmlElement.style.background = oldBackground
          }
        })
        htmlElement.addEventListener("mouseover", () => {
          htmlElement.style.background = '#cccccc'
          htmlElement.focus()
        })
        htmlElement.addEventListener("mouseout", () => {
          htmlElement.style.background = oldBackground
        })
      }
    })
  }

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
    const fields = this.props.lexicon.keys().map((key: string) => (
      <Field
        localPath={key}
        value={this.props.lexicon.get(key)}
        onChange={this.sendLexiconEditorChange}
        justClickedElement={this.state.justClickedElement}
      />
    ))

    return (
      <div id="LexiconEditor">

        <LocaleChooser lexicon={this.props.lexicon}
          selectedLocale={this.props.selectedLocale}
          switchLocale={this.props.switchLocale} />

        {
          fields.map(field => (
            <FormRow key={field.props.localPath} label={field.props.localPath}>
              {field}
            </FormRow>
          ))
        }
      </div>
    );
  }
}
