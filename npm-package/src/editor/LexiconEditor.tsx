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

type TabType = string; // filename like "messages.json"

// Remove text before the first dot from a key path
const stripFilePrefix = (keyPath: string): string => {
  const dotIndex = keyPath.indexOf('.');
  return dotIndex > -1 ? keyPath.substring(dotIndex + 1) : keyPath;
};

// Tab navigation component
const TabNavigation = ({
  activeTab,
  setActiveTab,
  tabNames,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabNames: string[];
}) => {
  return (
    <div className="LexiconEditorTabs">
      {tabNames.map((tabName) => (
        <button
          key={tabName}
          className={`LexiconEditorTab ${activeTab === tabName ? "active" : ""}`}
          onClick={() => setActiveTab(tabName)}
          data-text={tabName}
          title={tabName}
        >
          {tabName}
        </button>
      ))}
    </div>
  );
};

function LocaleChooser({ lexicon, switchLocale, selectedLocale }) {
  return (
    <div className="LocaleChooserContainer">
      {lexicon.locales().map((locale: string) => (
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
      ))}
    </div>
  );
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
  {
    justClickedElement: string;
    activeTab: TabType;
    pageKeys: string[];
    tabNames: string[];
  }
> {
  private mutationObserver: MutationObserver | null = null;

  constructor(props) {
    super(props);
    const tabNames = this.getTabNames();
    this.state = {
      justClickedElement: "",
      activeTab: tabNames.length > 0 ? tabNames[0] : "",
      pageKeys: [],
      tabNames: tabNames,
    };
  }

  getTabNames(): string[] {
    // Extract unique filenames from all sub-lexicons in the hub
    const filenames = new Set<string>();
    const keys = this.props.lexicon.keys();

    for (const key of keys) {
      try {
        const source = this.props.lexicon.source(key);
        const filename = source.filename;
        // Extract just the filename without the path
        const basename = filename.split('/').pop() || filename;
        filenames.add(basename);
      } catch (e) {
        // Skip keys that can't be sourced
      }
    }

    return Array.from(filenames).sort();
  }

  setJustClickedElement = (value: string) =>
    this.setState({ justClickedElement: value });

  setActiveTab = (tab: TabType) => this.setState({ activeTab: tab });

  componentDidMount() {
    this.makeElementsClickEditable();
    this.updatePageKeys();
    this.setupMutationObserver();
  }

  setupMutationObserver() {
    // Create a mutation observer to watch for changes to the DOM
    this.mutationObserver = new MutationObserver((mutations) => {
      // Check if any of the mutations involve elements with data-lexicon attributes
      const shouldUpdate = mutations.some((mutation) => {
        // Check added nodes
        if (mutation.addedNodes.length > 0) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              // Check if the element or any of its children have data-lexicon
              if (
                element.hasAttribute("data-lexicon") ||
                element.querySelector("[data-lexicon]")
              ) {
                return true;
              }
            }
          }
        }

        // Check removed nodes
        if (mutation.removedNodes.length > 0) {
          for (const node of Array.from(mutation.removedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              // Check if the element or any of its children have data-lexicon
              if (
                element.hasAttribute("data-lexicon") ||
                element.querySelector("[data-lexicon]")
              ) {
                return true;
              }
            }
          }
        }

        // Check attribute changes
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-lexicon"
        ) {
          return true;
        }

        return false;
      });

      if (shouldUpdate) {
        this.updatePageKeys();
        this.makeElementsClickEditable();
      }
    });

    // Start observing
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-lexicon"],
    });
  }

  updatePageKeys() {
    // Get all keys present on the current page from data-lexicon attributes
    const allDataLexicon = document.querySelectorAll("[data-lexicon]");
    const pageKeys = Array.from(allDataLexicon).map((element) => {
      const htmlElement = element as HTMLElement;
      return htmlElement.getAttribute("data-lexicon");
    });

    // Store unique keys
    this.setState({ pageKeys: [...new Set(pageKeys)] });
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

    // Disconnect the mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  clickEditHandler = (e: MouseEvent) => {
    if (!e.shiftKey && !e.metaKey) return;

    const htmlTarget = e.target as HTMLElement;
    let lexiconAttribute = htmlTarget.getAttribute("data-lexicon");
    let inputElement = document.getElementById(lexiconAttribute); // input that corresponds to clicked value
    this.props.toggleEditor();
    inputElement.scrollIntoView();
    this.setJustClickedElement(lexiconAttribute);

    // Switch to "This Page" tab if we click on a page element
    this.setActiveTab("thisPage");
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
    // Filter keys based on active tab filename
    const keys = this.props.lexicon.keys();
    let filteredKeys = keys.filter((key: string) => {
      try {
        const source = this.props.lexicon.source(key);
        const filename = source.filename;
        const basename = filename.split('/').pop() || filename;
        return basename === this.state.activeTab;
      } catch (e) {
        return false;
      }
    });

    const fields = filteredKeys.map((key: string) => (
      <Field
        key={key}
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
        <TabNavigation
          activeTab={this.state.activeTab}
          setActiveTab={this.setActiveTab}
          tabNames={this.state.tabNames}
        />

        <LocaleChooser
          lexicon={this.props.lexicon}
          selectedLocale={this.props.selectedLocale}
          switchLocale={this.props.switchLocale}
        />

        {fields.map((field) => (
          <FormRow key={field.props.localPath} label={stripFilePrefix(field.props.localPath)}>
            {field}
          </FormRow>
        ))}
        {!fields.length && (
          <div className="no-keys-message">No keys found.</div>
        )}
      </div>
    );
  }
}
