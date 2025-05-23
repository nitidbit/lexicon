/*
    LexiconEditor - Component that lists keys and values which you can edit
    - plus the Locale radio buttons
*/
import React, { useState, useEffect, useRef } from "react";

import { Lexicon } from "../Lexicon";
import { KeyPath, KeyPathString, keyPathAsString } from "../collection";
import "./LexiconEditorStyles.css";

export const expandedStyle = (isExpanded = true, ref) => {
  let height = "1.5em";
  const maxHeight = `${window.innerHeight * 0.8}px`;
  if (ref && isExpanded) {
    const scrollHeight = ref.current.scrollHeight;
    height = `${scrollHeight}px`;
  }
  return {
    height: height,
    maxHeight: maxHeight,
    overflow: isExpanded ? "auto" : "hidden",
    transition: "height 0.1s",
    background: isExpanded ? "#ffffdd" : "",
    border: isExpanded ? "2px solid #0000ff" : "none",
  };
};

export type OnChangeCallback = (change: {
  filename: string;
  localPath: KeyPathString;
  updatePath: KeyPath;
  newValue: string;
}) => void;
export type SwitchLocaleCallback = (newLocale: string) => void;

type HtmlOnChangeCallback = (
  event: React.ChangeEvent<HTMLTextAreaElement>
) => void;

function LocaleChooser({ lexicon, switchLocale, selectedLocale }) {
  return lexicon.locales().map((locale: string) => (
    <label htmlFor={`localeRadio__${locale}`} key={locale}>
      <input
        type="radio"
        id={`localeRadio__${locale}`}
        value={locale}
        checked={locale == selectedLocale}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          switchLocale(e.target.value)
        }
      />
      {locale}
    </label>
  ));
}

const FormRow = (props: { label: string; children: any }) => (
  <div id="FormRow">
    <label title={props.label}>
      <span className="label">{props.label}</span>
      {props.children}
    </label>
  </div>
);

function Field({
  localPath,
  value,
  onChange,
  justClickedElement,
  setJustClickedElement,
  visible,
}: {
  localPath: string;
  value: any;
  onChange: HtmlOnChangeCallback;
  justClickedElement: string;
  setJustClickedElement: (value: string) => void;
  visible: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (justClickedElement === localPath && visible) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
    if (visible === false) {
      setIsExpanded(false);
      setJustClickedElement(null);
    }
  }, [value, isExpanded, justClickedElement, visible]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event);
  };

  const clickit = (e) => {
    // need to set isExpanded to true
    setIsExpanded(true);
    setJustClickedElement(e.target.id);
    e.target.style.height = "4em";
  };

  return (
    <textarea
      ref={textareaRef}
      name={localPath}
      id={localPath}
      value={value}
      onClick={clickit}
      onChange={handleChange}
      style={expandedStyle(isExpanded, textareaRef)}
    />
  );
}

export interface LexiconEditorProps {
  lexicon: Lexicon;
  onChange: OnChangeCallback;
  selectedLocale: string;
  switchLocale: SwitchLocaleCallback;
  toggleEditor: () => void;
  visible: boolean;
}

export class LexiconEditor extends React.Component<
  LexiconEditorProps,
  { justClickedElement: string }
> {
  constructor(props) {
    super(props);
    this.state = { justClickedElement: "" };
  }

  setJustClickedElement = (value: string) =>
    this.setState({ justClickedElement: value });

  componentDidMount() {
    this.makeElementsClickEditable();
  }

  makeElementsClickEditable() {
    // attach listener to all elements in DOM with 'data-lexicon'
    const allDataLexicon = document.querySelectorAll("[data-lexicon]");
    Array.from(allDataLexicon).forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.addEventListener("click", this.clickEditHandler);
    });
  }

  componentWillUnmount() {
    const allDataLexicon = document.querySelectorAll("[data-lexicon]");
    Array.from(allDataLexicon).forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.removeEventListener("click", this.clickEditHandler);
    });
  }

  clickEditHandler = (e: MouseEvent) => {
    if (!e.shiftKey && !e.metaKey) return;

    const htmlTarget = e.target as HTMLElement;
    let lexiconAttribute = htmlTarget.getAttribute("data-lexicon");
    let inputElement = document.getElementById(lexiconAttribute); // input that corresponds to clicked value
    this.props.toggleEditor();
    inputElement.scrollIntoView();
    this.setJustClickedElement(lexiconAttribute);
  };

  sendLexiconEditorChange = (event) => {
    const { name: localPath, value: newValue } = event.target;
    const source = this.props.lexicon.source(localPath);
    const changeInfo = {
      filename: source.filename,
      localPath: keyPathAsString(source.localPath),
      updatePath: keyPathAsString(source.updatePath),
      newValue: newValue as string,
    };
    this.props.onChange(changeInfo);
  };

  render() {
    const fields = this.props.lexicon
      .keys()
      .map((key: string) => (
        <Field
          localPath={key}
          value={this.props.lexicon.get(key)}
          onChange={this.sendLexiconEditorChange}
          justClickedElement={this.state.justClickedElement}
          setJustClickedElement={this.setJustClickedElement}
          visible={this.props.visible}
        />
      ));

    return (
      <div id="LexiconEditor">
        <LocaleChooser
          lexicon={this.props.lexicon}
          selectedLocale={this.props.selectedLocale}
          switchLocale={this.props.switchLocale}
        />

        {fields.map((field) => (
          <FormRow key={field.props.localPath} label={field.props.localPath}>
            {field}
          </FormRow>
        ))}
      </div>
    );
  }
}
