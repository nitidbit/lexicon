"use strict";
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
                const newChanges = new Map(oldState.unsavedChanges);
                const fullPath = `${oldState.lexicon.currentLocaleCode}.${contentKey}`;
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
                return {
                    lexicon: newLexicon,
                    unsavedChanges: newChanges,
                    savingState: newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available
                };
            });
        };
        this.switchLocale = (newLocale) => {
            this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
        };
        this.saveChanges = () => {
            this.setState({ savingState: SavingState.InProgress });
            const fetchOptions = {
                method: 'PUT',
                mode: 'cors',
                headers: Object.assign({ 'Authorization': `Bearer ${this.getToken()}`, 'Content-Type': 'application/json' }, this.props.extraHeaders),
                body: JSON.stringify({
                    changes: [...this.state.unsavedChanges.entries()].map(([key, { newValue }]) => ({
                        filename: this.state.lexicon.filename,
                        key,
                        newValue,
                    })),
                }),
            };
            fetch(this.props.apiUpdateUrl, fetchOptions)
                .then(response => response.json())
                .catch(error => this.setState({ savingState: SavingState.Error, errorMessage: error.toString() }))
                .then((json) => {
                if (json.successful) {
                    this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
                }
                else {
                    this.setState({ savingState: SavingState.Error, errorMessage: json.error });
                }
            });
        };
        this.changePosition = (e) => {
            const newPos = e.target.name;
            if (newPos == 'left' || newPos == 'bottom' || newPos == 'right') {
                this.setState({ position: newPos });
            }
        };
        this.state = {
            isEditorVisible: false,
            lexicon: props.lexicon,
            unsavedChanges: new Map(),
            savingState: SavingState.NoChanges,
            position: 'left',
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
        const { component, children, OptionalLogoutButton } = this.props, { isEditorVisible, lexicon } = this.state;
        // Did the caller pass just a component, or a [component, {with: props}]?
        let renderedComponent = null;
        let renderedComponentProps = {};
        if (Array.isArray(component)) {
            renderedComponent = component[0];
            renderedComponentProps = component[1];
        }
        else {
            renderedComponent = component;
        }
        if (!this.allowEditing()) {
            return react_1.default.createElement(renderedComponent, Object.assign({ lexicon }, renderedComponentProps), children);
        }
        else {
            let buttonText, buttonEnabled;
            switch (this.state.savingState) {
                case SavingState.NoChanges:
                    buttonText = 'Nothing to Save';
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
            // Did the caller pass just a component, or a [component, {with: props}]?
            let renderedComponent = null;
            let renderedComponentProps = {};
            if (Array.isArray(component)) {
                renderedComponent = component[0];
                renderedComponentProps = component[1];
            }
            else {
                renderedComponent = component;
            }
            return (react_1.default.createElement("div", { className: "EditWrapper" },
                react_1.default.createElement(renderedComponent, Object.assign({ lexicon }, renderedComponentProps), children),
                react_1.default.createElement("div", { className: 'buttons' },
                    react_1.default.createElement("button", { onClick: this.toggleEditor, className: "edit-wrapper-button" }, isEditorVisible ? 'Hide Editor' : 'Edit Content'),
                    OptionalLogoutButton && react_1.default.createElement(OptionalLogoutButton, null)),
                react_1.default.createElement("div", { className: `wrapped-lexicon-editor docked-${this.state.position}${this.state.isEditorVisible ? ' is-visible' : ''}` },
                    react_1.default.createElement("hgroup", null,
                        react_1.default.createElement("h2", { className: "wrapper-heading" }, "Content Editor"),
                        react_1.default.createElement("div", { className: "position" }, [['left', '\u25e7'],
                            ['bottom', '\u2b13'],
                            ['right', '\u25e8']].map(([pos, icon]) => (react_1.default.createElement("label", { className: this.state.position == pos ? 'selected' : '' },
                            icon,
                            react_1.default.createElement("input", { type: "radio", name: pos, onClick: this.changePosition }))))),
                        react_1.default.createElement("label", { className: "close-btn" },
                            " \u00D7",
                            react_1.default.createElement("button", { onClick: this.toggleEditor }))),
                    react_1.default.createElement(LexiconEditor_1.default, { lexicon: lexicon, onChange: this.updateText, selectedLocale: lexicon.currentLocaleCode, switchLocale: this.switchLocale }),
                    react_1.default.createElement("div", { className: "save-box" },
                        react_1.default.createElement("button", { onClick: this.saveChanges, disabled: !buttonEnabled }, buttonText)),
                    this.state.savingState == SavingState.Error && react_1.default.createElement("p", { className: "error-message" }, this.state.errorMessage))));
        }
    }
}
exports.default = EditWrapper;
