"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Lexicon_1 = require("./Lexicon");
const index_1 = require("./index");
const LexiconEditor_1 = require("./LexiconEditor");
require("./EditWrapperStyles.css");
const util_1 = require("./util");
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
            this.setState(Object.assign(Object.assign({}, this.state), { isEditorVisible: !this.state.isEditorVisible }));
        };
        this.updateTextFromEditor = (change) => {
            this.setState(oldState => {
                const newLexicon = oldState.lexicon.cloneDeep();
                newLexicon.update(change.updatePath, change.newValue);
                const fileKey = JSON.stringify({
                    filename: change.filename,
                    localPath: change.localPath
                }); // we stringify here because Javascript never treats multiple objects as the same one even if the keys and values are all identical
                const existingChange = oldState.unsavedChanges.get(fileKey);
                let originalValue = existingChange && existingChange.originalValue;
                const newChanges = new Map(oldState.unsavedChanges);
                if (originalValue == change.newValue) {
                    newChanges.delete(fileKey); // They changed it back to original value--no net change
                }
                else {
                    originalValue = originalValue || oldState.lexicon.getExact(change.localPath.slice(3)); // the slice trims off locale aka 'en.'
                    newChanges.set(fileKey, { originalValue, newValue: change.newValue });
                }
                return {
                    lexicon: newLexicon,
                    unsavedChanges: newChanges,
                    savingState: newChanges.size == 0 ? SavingState.NoChanges : SavingState.Available,
                };
            });
        };
        this.switchLocale = (newLocale) => {
            this.setState({ lexicon: this.state.lexicon.locale(newLocale) });
        };
        this.saveChanges = () => {
            this.setState({ savingState: SavingState.InProgress });
            const headers = Object.assign({ 'Authorization': `Bearer ${this.getToken()}`, 'Content-Type': 'application/json' }, this.props.extraHeaders);
            const listOfChanges = [...this.state.unsavedChanges.entries()].map(([fileKeyString, { newValue }]) => {
                const fileKey = JSON.parse(fileKeyString);
                return {
                    filename: fileKey.filename,
                    key: fileKey.localPath,
                    newValue,
                };
            });
            const payload = { changes: listOfChanges };
            fetch(this.props.apiUpdateUrl, {
                method: 'PUT',
                mode: 'cors',
                headers: headers,
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then((json) => {
                if (json.successful) {
                    this.setState({ savingState: SavingState.Done, unsavedChanges: new Map() });
                }
                else {
                    this.setState({ savingState: SavingState.Error, errorMessage: json.error });
                }
            })
                .catch(error => this.setState({ savingState: SavingState.Error, errorMessage: error.toString() }));
        };
        this.changePosition = (e) => {
            const newPos = e.currentTarget.name;
            if ((newPos === 'left' || newPos === 'right') && this.state.position !== 'bottom') {
                const currentWidth = this.state.editorWidth;
                this.setState({
                    position: newPos,
                    editorWidth: currentWidth,
                });
            }
            else if ((newPos === 'left' || newPos === 'right') && this.state.position === 'bottom') {
                this.setState({
                    position: newPos,
                    editorHeight: undefined,
                });
            }
            else if (newPos === 'bottom' && (this.state.position === 'left' || this.state.position === 'right')) {
                this.setState({
                    position: newPos,
                    editorWidth: undefined,
                });
            }
        };
        this.startResizing = (e) => {
            window.addEventListener('mousemove', this.resize);
            window.addEventListener('mouseup', this.stopResizing);
        };
        this.resize = (e) => {
            const { position } = this.state;
            if (position === 'right') {
                this.setState({ editorWidth: window.innerWidth - e.clientX });
            }
            else if (position === 'left') {
                this.setState({ editorWidth: e.clientX });
            }
            else if (position === 'bottom') {
                this.setState({ editorHeight: window.innerHeight - e.clientY });
            }
        };
        this.stopResizing = () => {
            window.removeEventListener('mousemove', this.resize);
            window.removeEventListener('mouseup', this.stopResizing);
        };
        if (!(props.lexicon instanceof Lexicon_1.Lexicon))
            throw new Error(`'lexicon' prop should be a Lexicon object, but it is: ${JSON.stringify(props.lexicon).substring(0, 50)}`);
        this.grabLexiconServerTokenAndReload();
        this.state = {
            isEditorVisible: false,
            lexicon: props.lexicon,
            unsavedChanges: new Map(),
            savingState: SavingState.NoChanges,
            position: 'left',
            editorWidth: undefined,
            editorHeight: undefined,
        };
    }
    // If URL has ?lexiconServerToken=___, then store it, reload, and show the editing buttons
    grabLexiconServerTokenAndReload() {
        let lexiconServerToken = (0, util_1.getURLParameter)('lexiconServerToken');
        if (lexiconServerToken) {
            sessionStorage.setItem('lexiconServerToken', lexiconServerToken); // Save token
            // Reload to remove token from URL
            let locationWithoutToken = window.location.href.split("?")[0];
            window.history.replaceState(null, null, locationWithoutToken);
            if (document.location.protocol != 'https:') {
                console.warn('You should use HTTPS otherwise the lexiconServerToken is passed insecurely');
            }
        }
    }
    getToken() {
        if ('apiToken' in this.props) {
            return this.props.apiToken;
        }
        else {
            return sessionStorage.lexiconServerToken;
        }
    }
    allowEditing() {
        let result;
        if ('allowEditing' in this.props) {
            result = this.props.allowEditing;
        }
        else {
            result = sessionStorage.hasOwnProperty('lexiconServerToken');
        }
        return result;
    }
    render() {
        const { component, children, OptionalLogoutButton } = this.props, { isEditorVisible, lexicon, editorWidth, editorHeight } = this.state;
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
                    react_1.default.createElement("button", { onClick: this.toggleEditor, className: "edit-wrapper-button" }, isEditorVisible ? 'Hide Lexicon' : 'Edit Lexicon'),
                    OptionalLogoutButton && react_1.default.createElement(OptionalLogoutButton, null)),
                react_1.default.createElement("div", { className: `wrapped-lexicon-editor docked-${this.state.position}${this.state.isEditorVisible ? ' is-visible' : ''}`, style: { width: editorWidth, height: editorHeight } },
                    react_1.default.createElement("hgroup", null,
                        react_1.default.createElement("h2", { className: "wrapper-heading" }, "Lexicon"),
                        react_1.default.createElement("div", { className: "position" }, [['left', '\u25e7'],
                            ['bottom', '\u2b13'],
                            ['right', '\u25e8']].map(([pos, icon]) => (react_1.default.createElement("label", { key: pos, className: this.state.position == pos ? 'selected' : '' },
                            icon,
                            react_1.default.createElement("input", { type: "radio", name: pos, onClick: this.changePosition }))))),
                        react_1.default.createElement("label", { className: "close-btn" },
                            " \u00D7",
                            react_1.default.createElement("button", { onClick: this.toggleEditor }))),
                    react_1.default.createElement(LexiconEditor_1.LexiconEditor, { lexicon: lexicon, onChange: this.updateTextFromEditor, selectedLocale: lexicon.currentLocaleCode, switchLocale: this.switchLocale }),
                    react_1.default.createElement("div", { className: "save-box" },
                        react_1.default.createElement("span", null,
                            " v",
                            index_1.VERSION,
                            " "),
                        react_1.default.createElement("button", { onClick: this.saveChanges, disabled: !buttonEnabled }, buttonText)),
                    this.state.savingState == SavingState.Error && react_1.default.createElement("p", { className: "error-message" }, this.state.errorMessage),
                    react_1.default.createElement("div", { className: `resizer resizer-${this.state.position}`, onMouseDown: this.startResizing }))));
        }
    }
}
exports.default = EditWrapper;