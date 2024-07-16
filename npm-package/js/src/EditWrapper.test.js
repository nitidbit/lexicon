"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("@testing-library/jest-dom");
// import '@testing-library/jest-dom/extend-expect'
const react_2 = require("@testing-library/react");
const Lexicon_1 = require("./Lexicon");
const EditWrapper_1 = __importDefault(require("./EditWrapper"));
const SampleComponent = () => (react_1.default.createElement("div", { className: "SampleComponent" }, " Sample "));
const sampleLexicon = new Lexicon_1.Lexicon({ en: { blah: 'BLAH' } }, 'en', '??');
const renderScreen = () => ((0, react_2.render)(react_1.default.createElement(EditWrapper_1.default, { component: SampleComponent, lexicon: sampleLexicon, apiUpdateUrl: 'example.com/update', allowEditing: true })));
describe('EditWrapper', () => {
    describe('saveChanges()', () => {
        it('renders <component>', () => {
            const screen = renderScreen();
            expect(screen.queryByText('Sample')).toBeInTheDocument();
        });
    });
});
