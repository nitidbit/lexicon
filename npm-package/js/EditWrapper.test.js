"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import '@testing-library/jest-dom/extend-expect'
const react_1 = require("@testing-library/react");
const react_2 = __importDefault(require("react"));
const Lexicon_1 = require("./Lexicon");
const EditWrapper_1 = __importDefault(require("./EditWrapper"));
const SampleComponent = () => (react_2.default.createElement("div", { className: "SampleComponent" }, " Sample "));
const sampleLexicon = new Lexicon_1.Lexicon({ en: { blah: 'BLAH' } }, 'en', '??');
const renderScreen = () => ((0, react_1.render)(react_2.default.createElement(EditWrapper_1.default, { component: SampleComponent, lexicon: sampleLexicon, apiUpdateUrl: 'example.com/update', allowEditing: true })));
describe('EditWrapper', () => {
    describe('saveChanges()', () => {
        it('renders <component>', () => {
            const screen = renderScreen();
            expect(screen.queryByText('Sample')).toBeInTheDocument();
        });
        it('shows useful error when server returns json formatted error response', () => {
            const screen = renderScreen();
            // editWrapper.updateTextFromEditor({
            //   updatePath: 'example.json',
            //   localPath: 'en.blah',
            //   newValue: 'Blah Blah',
            // })
            // expect(editWrapper.newChanges.length).toEqual(1)
        });
    });
});
