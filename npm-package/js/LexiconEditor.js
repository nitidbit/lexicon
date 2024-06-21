"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexiconEditor = void 0;
const react_1 = __importDefault(require("react"));
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
const Field = ({ localPath, value, onChange }) => (react_1.default.createElement("textarea", { name: localPath, value: value, onChange: onChange }));
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
