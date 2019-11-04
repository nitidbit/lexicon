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
class LogoutForm extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.doLogout = (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const token = localStorage.getItem('lexiconEditorToken');
            this.setState({ loading: true });
            try {
                const data = yield (yield fetch(this.props.endpoint, {
                    mode: 'cors',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })).json();
                if (data.successful) {
                    this.setState({ loading: false, successful: true });
                    localStorage.removeItem('lexiconEditorToken');
                }
                else {
                    this.setState({
                        loading: false,
                        successful: false,
                        error: data.error,
                    });
                }
            }
            catch (e) {
                this.setState({
                    loading: false,
                    successful: false,
                    error: e,
                });
            }
        });
        this.state = {
            loading: false,
            successful: false,
        };
    }
    render() {
        const { successful, loading, error } = this.state;
        if (loading) {
            status = 'Logging you out...';
        }
        else {
            if (successful) {
                status = 'You are now logged out.';
            }
            else if (error !== undefined) {
                status = `Error: ${error}`;
            }
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("button", { onClick: this.doLogout }, "Log out"),
            react_1.default.createElement("br", null),
            react_1.default.createElement("small", null, status)));
    }
}
exports.default = LogoutForm;
