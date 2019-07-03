import React from 'react';
declare type LoginFormProps = {
    endpoint: string;
};
declare type LoginFormState = {
    loading: boolean;
    successful: boolean;
    error?: string;
    password: string;
};
export default class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
    constructor(props: LoginFormProps);
    render(): JSX.Element;
    handleSubmission: (e: React.FormEvent<Element>) => Promise<void>;
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void;
}
export {};
