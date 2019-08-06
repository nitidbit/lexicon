"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LexiconEditor_1 = __importDefault(require("./LexiconEditor"));
require("../styles/EditWrapperStyles.scss");
class EditWrapper extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.toggleEditor = () => {
            this.setState(Object.assign({}, this.state, { isEditorVisible: !this.state.isEditorVisible }));
        };
        this.updateText = (contentKey, newValue) => {
            this.setState(oldState => {
                const newLexicon = oldState.lexicon.clone();
                newLexicon.update(contentKey, newValue);
                return { lexicon: newLexicon };
            });
        };
        this.switchLocale = (newLocale) => {
            this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
        };
        this.state = {
            isEditorVisible: false,
            lexicon: props.lexicon,
        };
    }
    allowEditing() {
        return true;
    }
    render() {
        const { component, children } = this.props, { isEditorVisible, lexicon } = this.state;
        if (this.allowEditing()) {
            return (react_1.default.createElement("div", { className: "EditWrapper" },
                react_1.default.createElement(component, { lexicon }, children),
                react_1.default.createElement("button", { onClick: this.toggleEditor, className: "edit-wrapper-button" }, isEditorVisible ? 'Hide Editor' : 'Edit Content'),
                react_1.default.createElement("div", { className: `wrapped-lexicon-editor${this.state.isEditorVisible ? ' is-visible' : ''}` },
                    react_1.default.createElement(LexiconEditor_1.default, { lexicon: lexicon, onChange: this.updateText, selectedLocale: lexicon.defaultLocale, switchLocale: this.switchLocale }))));
        }
        return react_1.default.createElement(component, { lexicon }, children);
    }
}
exports.default = EditWrapper;
