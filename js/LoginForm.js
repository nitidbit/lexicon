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
class LoginForm extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSubmission = (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            this.setState({ loading: true });
            try {
                const data = yield (yield fetch(this.props.endpoint, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: this.state.password }),
                })).json();
                if (data.successful) {
                    sessionStorage.setItem('lexiconServerToken', data.token);
                    this.setState({ loading: false, successful: true });
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
        this.handleChange = (e) => {
            this.setState({ password: e.currentTarget.value });
        };
        this.state = {
            loading: false,
            successful: false,
            password: '',
        };
    }
    render() {
        const { successful, password, loading, error } = this.state;
        let status = '';
        if (loading) {
            status = 'Logging you in...';
        }
        else {
            if (successful) {
                status = 'You are now logged in.';
            }
            else if (error !== undefined) {
                status = `Error: ${error}`;
            }
        }
        return (react_1.default.createElement("form", { onSubmit: this.handleSubmission },
            react_1.default.createElement("label", { htmlFor: "password" }, "Password:"),
            react_1.default.createElement("br", null),
            react_1.default.createElement("input", { type: "password", id: "password", name: "password", value: password, onChange: this.handleChange, disabled: successful || loading }),
            react_1.default.createElement("br", null),
            react_1.default.createElement("input", { type: "submit", value: "Log in", disabled: successful || loading }),
            react_1.default.createElement("br", null),
            react_1.default.createElement("small", null, status)));
    }
}
exports.default = LoginForm;
