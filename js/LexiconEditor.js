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
const ShortString = ({ contentKey, value, onChange }) => (react_1.default.createElement("input", { type: "text", id: "ShortString", name: contentKey, defaultValue: value, onChange: onChange }));
const LexiconEditor = ({ lexicon, onChange }) => {
    const sendLexiconEditorChange = (event) => {
        const { name: contentKey, value: newValue } = event.target;
        onChange(contentKey, newValue);
    };
    return (react_1.default.createElement("div", { id: "LexiconEditor" },
        react_1.default.createElement("h2", null, "Content Editor"),
        lexicon.keys().map((key) => (react_1.default.createElement(FormRow, { key: key, label: key },
            react_1.default.createElement(ShortString, { contentKey: key, value: lexicon.get(key), onChange: sendLexiconEditorChange }))))));
};
exports.default = LexiconEditor;
