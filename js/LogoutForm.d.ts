import React from 'react';
declare type LogoutFormProps = {
    endpoint: string;
};
declare type LogoutFormState = {
    loading: boolean;
    successful: boolean;
    error?: string;
};
export default class LogoutForm extends React.Component<LogoutFormProps, LogoutFormState> {
    constructor(props: LogoutFormProps);
    render(): JSX.Element;
    doLogout: (e: React.FormEvent<Element>) => Promise<void>;
}
export {};
