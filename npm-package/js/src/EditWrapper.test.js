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
const react_2 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
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
        it('has the Edit Lexicon button', () => {
            const screen = renderScreen();
            // screen.debug()
            expect(screen.queryByText('Edit Lexicon')).toBeInTheDocument();
        });
        const simulateEditAndSave = () => __awaiter(void 0, void 0, void 0, function* () {
            const user = user_event_1.default.setup();
            const screen = renderScreen();
            yield user.click(screen.getByLabelText('blah'));
            yield user.keyboard('BLARGH');
            yield user.click(screen.getByText('Save changes'));
            return screen;
        });
        it('shows useful message when there is a network level problem (no wifi, cors)', () => __awaiter(void 0, void 0, void 0, function* () {
            global.fetch = jest.fn(() => {
                return Promise.reject(new TypeError('MOCK NETWORK ERROR'));
            });
            const screen = yield simulateEditAndSave();
            expect(screen.getByText(/MOCK NETWORK ERROR/)).toBeInTheDocument();
        }));
        it('shows useful error when server returns json formatted error response', () => __awaiter(void 0, void 0, void 0, function* () {
            const RESPONSE = {
                succcess: false,
                error: "something went wrong",
            };
            global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve(RESPONSE) }));
            const screen = yield simulateEditAndSave();
            expect(screen.getByText(/something went wrong/)).toBeInTheDocument();
        }));
    });
});
