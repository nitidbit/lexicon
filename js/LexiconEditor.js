"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("../styles/LexiconEditorStyles.scss");
const FormRow = (props) => (react_1.default.createElement("div", { id: "FormRow" },
    react_1.default.createElement("label", { title: props.label },
        react_1.default.createElement("span", { className: "label" }, props.label),
        props.children)));
const Field = ({ contentKey, value, onChange }) => (react_1.default.createElement("textarea", { name: contentKey, value: value, onChange: onChange }));
const LexiconEditor = ({ lexicon, onChange, selectedLocale, switchLocale }) => {
    const sendLexiconEditorChange = (event) => {
        const { name: contentKey, value: newValue } = event.target;
        onChange(contentKey, newValue);
    };
    return (react_1.default.createElement("div", { id: "LexiconEditor" },
        lexicon.locales().map((locale) => (react_1.default.createElement("label", { htmlFor: `localeRadio__${locale}`, key: locale },
            react_1.default.createElement("input", { type: "radio", id: `localeRadio__${locale}`, value: locale, checked: locale == selectedLocale, onChange: (e) => switchLocale(e.target.value) }),
            locale))),
        lexicon.keys().map((key) => (react_1.default.createElement(FormRow, { key: key, label: key },
            react_1.default.createElement(Field, { contentKey: key, value: lexicon.get(key), onChange: sendLexiconEditorChange }))))));
};
exports.default = LexiconEditor;
