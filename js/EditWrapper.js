"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LexiconEditor_1 = __importDefault(require("./LexiconEditor"));
require("../styles/EditWrapperStyles.scss");
var SavingState;
(function (SavingState) {
    SavingState[SavingState["NoChanges"] = 0] = "NoChanges";
    SavingState[SavingState["Available"] = 1] = "Available";
    SavingState[SavingState["InProgress"] = 2] = "InProgress";
    SavingState[SavingState["Done"] = 3] = "Done";
    SavingState[SavingState["Error"] = 4] = "Error";
})(SavingState || (SavingState = {}));
;
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
                const newChanges = new Map(oldState.unsavedChanges), fullPath = `${oldState.lexicon.defaultLocale}.${contentKey}`;
                if (newChanges.has(fullPath)) {
                    if (newChanges.get(fullPath).originalValue == newValue) {
                        newChanges.delete(fullPath);
                    }
                    else {
                        const originalValue = newChanges.get(fullPath).originalValue;
                        newChanges.set(fullPath, { originalValue, newValue });
                    }
                }
                else {
                    newChanges.set(fullPath, { originalValue: oldState.lexicon.get(contentKey), newValue });
                }
                return { lexicon: newLexicon, unsavedChanges: newChanges, savingState: newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available };
            });
        };
        this.switchLocale = (newLocale) => {
            this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
        };
        this.saveChanges = () => __awaiter(this, void 0, void 0, function* () {
            this.setState({ savingState: SavingState.InProgress });
            const fetchOptions = {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    changes: [...this.state.unsavedChanges.entries()].map(([key, { newValue }]) => ({
                        filename: this.state.lexicon.filename,
                        key,
                        newValue,
                    })),
                }),
            };
            try {
                const response = yield fetch(this.props.apiUpdateUrl, fetchOptions);
                const json = (yield response.json());
                if (json.successful) {
                    this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
                }
                else {
                    this.setState({ savingState: SavingState.Error, errorMessage: json.error });
                }
            }
            catch (e) {
                this.setState({ savingState: SavingState.Error, errorMessage: e.toString() });
            }
        });
        this.state = {
            isEditorVisible: false,
            lexicon: props.lexicon,
            unsavedChanges: new Map(),
            savingState: SavingState.NoChanges,
        };
    }
    getToken() {
        if ('apiToken' in this.props) {
            return this.props.apiToken;
        }
        else {
            return localStorage.lexiconEditorToken;
        }
    }
    allowEditing() {
        if ('allowEditing' in this.props) {
            return this.props.allowEditing;
        }
        else {
            return localStorage.hasOwnProperty('lexiconEditorToken');
        }
    }
    render() {
        const { component, children } = this.props, { isEditorVisible, lexicon } = this.state;
        if (this.allowEditing()) {
            let buttonText, buttonEnabled;
            switch (this.state.savingState) {
                case SavingState.NoChanges:
                    buttonText = 'Save changes';
                    buttonEnabled = false;
                    break;
                case SavingState.Available:
                    buttonText = 'Save changes';
                    buttonEnabled = true;
                    break;
                case SavingState.InProgress:
                    buttonText = 'Saving...';
                    buttonEnabled = false;
                    break;
                case SavingState.Done:
                    buttonText = 'Saved!';
                    buttonEnabled = false;
                    break;
                case SavingState.Error:
                    buttonText = 'Save changes';
                    buttonEnabled = true;
                    break;
            }
            return (react_1.default.createElement("div", { className: "EditWrapper" },
                react_1.default.createElement(component, { lexicon }, children),
                react_1.default.createElement("button", { onClick: this.toggleEditor, className: "edit-wrapper-button" }, isEditorVisible ? 'Hide Editor' : 'Edit Content'),
                react_1.default.createElement("div", { className: `wrapped-lexicon-editor${this.state.isEditorVisible ? ' is-visible' : ''}` },
                    react_1.default.createElement(LexiconEditor_1.default, { lexicon: lexicon, onChange: this.updateText, selectedLocale: lexicon.defaultLocale, switchLocale: this.switchLocale }),
                    react_1.default.createElement("button", { onClick: this.saveChanges, disabled: !buttonEnabled }, buttonText),
                    this.state.savingState == SavingState.Error && react_1.default.createElement("p", null, this.state.errorMessage))));
        }
        return react_1.default.createElement(component, { lexicon }, children);
    }
}
exports.default = EditWrapper;
