"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexiconEditor = void 0;
const react_1 = __importStar(require("react"));
require("../styles/LexiconEditorStyles.scss");
const collection_1 = require("./collection");
function LocaleChooser({ lexicon, switchLocale, selectedLocale }) {
    return (lexicon.locales().map((locale) => (react_1.default.createElement("label", { htmlFor: `localeRadio__${locale}`, key: locale },
        react_1.default.createElement("input", { type: "radio", id: `localeRadio__${locale}`, value: locale, checked: locale == selectedLocale, onChange: (e) => switchLocale(e.target.value) }),
        locale))));
}
const FormRow = (props) => (react_1.default.createElement("div", { id: "FormRow" },
    react_1.default.createElement("label", { title: props.label },
        react_1.default.createElement("span", { className: "label" }, props.label),
        props.children)));
function Field({ localPath, value, onChange }) {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const textareaRef = (0, react_1.useRef)(null);
    const timeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (textareaRef.current && isExpanded) {
            adjustHeight();
        }
    }, [value, isExpanded]);
    (0, react_1.useEffect)(() => {
        const handleGlobalClick = (e) => {
            if (isExpanded && textareaRef.current && !textareaRef.current.contains(e.target)) {
                const clickedElement = e.target;
                if (clickedElement.tagName === 'TEXTAREA') {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleGlobalClick);
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [isExpanded]);
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
    const handleChange = (event) => {
        onChange(event);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(adjustHeight, 10);
    };
    return (react_1.default.createElement("textarea", { ref: textareaRef, name: localPath, value: value, onChange: handleChange, onFocus: handleFocus, style: {
            height: isExpanded ? 'auto' : '1.5em',
            overflow: isExpanded ? 'auto' : 'hidden',
            transition: 'height 0.1s',
        } }));
}
class LexiconEditor extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.sendLexiconEditorChange = (event) => {
            const { name: localPath, value: newValue } = event.target;
            const source = this.props.lexicon.source(localPath);
            const changeInfo = {
                filename: source.filename,
                localPath: (0, collection_1.keyPathAsString)(source.localPath),
                updatePath: (0, collection_1.keyPathAsString)(source.updatePath),
                newValue: newValue
            };
            this.props.onChange(changeInfo);
        };
    }
    render() {
        return (react_1.default.createElement("div", { id: "LexiconEditor" },
            react_1.default.createElement(LocaleChooser, { lexicon: this.props.lexicon, selectedLocale: this.props.selectedLocale, switchLocale: this.props.switchLocale }),
            this.props.lexicon.keys().map((key) => (react_1.default.createElement(FormRow, { key: key, label: key },
                react_1.default.createElement(Field, { localPath: key, value: this.props.lexicon.get(key), onChange: this.sendLexiconEditorChange }))))));
    }
}
exports.LexiconEditor = LexiconEditor;
