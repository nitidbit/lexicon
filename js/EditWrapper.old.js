"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LexiconEditor_1 = __importDefault(require("./LexiconEditor"));
const lodash_1 = __importDefault(require("lodash"));
const axios_1 = __importDefault(require("axios"));
require("../styles/EditWrapperStyles.scss");
class EditWrapper extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.toggleEditor = () => {
            this.setState((prevState) => ({
                isEditorVisible: !prevState.isEditorVisible
            }));
        };
        this.updateText = (contentKey, newValue) => {
            this.setState(oldState => {
                let newState = Object.assign({}, oldState);
                lodash_1.default.set(newState, `lexicon.${contentKey}`, newValue);
                newState.justSaved = false;
                newState.unsavedChanges = [...oldState.unsavedChanges];
                const [filename, key] = this.props.lexiconShape.fileAndKeyFor(contentKey);
                if (filename === undefined) {
                    throw new Error(`No filename provided on ${this.props.lexiconShape}!`);
                }
                const index = oldState.unsavedChanges.findIndex(c => (c.filename === filename && c.key === key));
                if (index >= 0) {
                    newState.unsavedChanges[index].newValue = newValue;
                }
                else {
                    newState.unsavedChanges.push({ filename, key, newValue });
                }
                return newState;
            });
        };
        this.saveChanges = () => {
            this.setState({ isSaving: true });
            axios_1.default.put(this.props.apiUpdateUrl, { changes: this.state.unsavedChanges }, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            })
                .then(() => {
                this.setState({ isSaving: false, unsavedChanges: [], errorMessage: undefined, justSaved: true });
            })
                .catch(error => {
                console.error(error);
                this.setState({ isSaving: false, justSaved: false });
                if (error.response) {
                    this.setState({ errorMessage: error.response.data });
                }
                else if (error.request) {
                    this.setState({ errorMessage: 'No response from server' });
                }
                else {
                    this.setState({ errorMessage: error.message });
                }
            });
        };
        this.state = {
            lexicon: props.lexiconShape.extract(props.lexicon),
            isEditorVisible: false,
            isSaving: false,
            unsavedChanges: [],
            justSaved: false,
        };
    }
    getToken() {
        if (this.props.hasOwnProperty('apiToken')) {
            return this.props.apiToken;
        }
        else {
            return localStorage.lexiconEditorToken;
        }
    }
    allowEditing() {
        if (this.props.hasOwnProperty('allowEditing')) {
            return this.props.allowEditing;
        }
        else {
            return localStorage.hasOwnProperty('lexiconEditorToken');
        }
    }
    render() {
        if (this.allowEditing()) {
            return (react_1.default.createElement("div", { className: "EditWrapper" },
                react_1.default.createElement(this.props.component, { lexicon: this.state.lexicon }, this.props.children),
                react_1.default.createElement("button", { onClick: this.toggleEditor, className: "edit-wrapper-button" }, this.state.isEditorVisible ? 'Hide Editor' : 'Edit Content'),
                react_1.default.createElement("div", { className: 'wrapped-lexicon-editor' + (this.state.isEditorVisible ? ' is-visible' : '') },
                    react_1.default.createElement(LexiconEditor_1.default, { flatShape: this.props.lexiconShape.flatShape(this.props.lexiconShape), lexicon: this.state.lexicon, onChange: this.updateText }),
                    this.state.errorMessage &&
                        react_1.default.createElement("div", null, this.state.errorMessage),
                    react_1.default.createElement("button", { onClick: this.saveChanges, disabled: this.state.unsavedChanges.length === 0 || this.state.isSaving, className: "edit-wrapper-button" }, "Save Changes"),
                    this.state.isSaving && 'Saving...',
                    this.state.justSaved && 'Saved!')));
        }
        return react_1.default.createElement(this.props.component, { lexicon: this.state.lexicon }, this.props.children);
    }
}
exports.default = EditWrapper;
