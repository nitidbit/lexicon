"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
jest.mock('./util', () => ({
    getURLParameter: () => ("SAMPLE_LEXICON_SERVER_TOKEN")
}));
const SampleComponent = () => (react_1.default.createElement("div", { className: "SampleComponent" }, " Sample "));
const sampleLexicon = new Lexicon_1.Lexicon({ en: { blah: 'BLAH' } }, 'en', '??');
const renderScreen = (props = {}) => {
    return (0, react_2.render)(react_1.default.createElement(EditWrapper_1.default, Object.assign({ component: SampleComponent, lexicon: sampleLexicon, apiUpdateUrl: 'example.com/update' }, props)));
};
describe('EditWrapper', () => {
    describe('saveChanges()', () => {
        it('renders <component>', () => {
            const screen = renderScreen();
            expect(screen.queryByText('Sample')).toBeInTheDocument();
        });
        it('has the Edit Lexicon button', () => __awaiter(void 0, void 0, void 0, function* () {
            const screen = renderScreen();
            // screen.debug()
            expect(yield screen.findByText('Edit Lexicon')).toBeInTheDocument();
        }));
        it('shows useful error when server returns json formatted error response', () => {
            // allowEditing={true} // opens the edit panel
        });
    });
});
