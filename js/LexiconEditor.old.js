"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const lodash_1 = __importDefault(require("lodash"));
require("../styles/LexiconEditorStyles.scss");
;
function FormRow(props) {
    return (React.createElement("div", { id: "FormRow" },
        React.createElement("label", { title: props.label },
            React.createElement("span", { className: "label" }, props.label),
            props.children)));
}
;
//
// Editors
//
const ShortString = function (props) {
    return (React.createElement("input", { type: "text", id: "ShortString", name: props.contentKey, defaultValue: props.value, onChange: props.onChange }));
};
function LongString(props) {
    return (React.createElement("textarea", { id: "LongString", name: props.contentKey, defaultValue: props.value, onChange: props.onChange }));
}
function QuestionAndAnswerEditor(props) {
    let questionKey = props.contentKey + '.question';
    let answerKey = props.contentKey + '.answer';
    return (React.createElement("div", { id: "QuestionAndAnswerEditor" },
        React.createElement(ShortString, { contentKey: questionKey, value: props.value.question, onChange: props.onChange }),
        React.createElement(LongString, { contentKey: answerKey, value: props.value.answer, onChange: props.onChange })));
}
function QuestionAndAnswerCollection(props) {
    let innerValues = props.value;
    let innerProps = lodash_1.default.omit(props, ['value', 'contentKey']);
    return (React.createElement("div", { id: "QuestionAndAnswerCollection" }, innerValues.map((questionAndAnswer, index) => {
        let innerContentKey = props.contentKey + `.${index}`;
        return (React.createElement("div", { className: "innerEditorBox", key: questionAndAnswer.question },
            React.createElement("div", { className: "numberTab" },
                " ",
                index,
                " "),
            React.createElement(QuestionAndAnswerEditor, Object.assign({ value: questionAndAnswer, contentKey: innerContentKey }, innerProps))));
    })));
}
;
const INPUT_EDITORS = Object.freeze({
    LongString,
    ShortString,
    QuestionAndAnswerEditor,
    QuestionAndAnswerCollection,
});
function UnknownInputType(LexiconShape) {
    let unknownEditorComponent = function (props) {
        return (React.createElement("div", { id: "UnknownInputType" },
            "(Unknown input type: ",
            LexiconShape.name(),
            ")"));
    };
    return unknownEditorComponent;
}
const editorForType = function (LexiconShape, contentKey, value, onChange) {
    let inputComponent = INPUT_EDITORS[LexiconShape.name()] || UnknownInputType(LexiconShape);
    return (React.createElement(FormRow, { key: contentKey, label: contentKey }, React.createElement(inputComponent, { contentKey, value, onChange })));
};
function LexiconEditor(props) {
    let sendLexiconEditorChange = (event) => {
        let contentKey = event.target.name;
        let newValue = event.target.value;
        props.onChange(contentKey, newValue);
    };
    return (React.createElement("div", { id: "LexiconEditor" },
        React.createElement("h2", null, " Content Editor "),
        lodash_1.default.map(props.flatShape, (row) => {
            let contentKey = row[0];
            let inputType = row[1];
            let theLemma = lodash_1.default.get(props.lexicon, contentKey);
            return editorForType(inputType, contentKey, theLemma, sendLexiconEditorChange);
        })));
}
exports.default = LexiconEditor;
