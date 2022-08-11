import React from 'react';
import { Lexicon } from './Lexicon';
import { OnChangeCallback } from './LexiconEditor';
import '../styles/EditWrapperStyles.scss';
interface EditWrapperProps {
    component: // This is the React component rendered inside the wrapper.
    React.FunctionComponent<{
        lexicon: Lexicon;
    }> | React.ComponentClass<{
        lexicon: Lexicon;
    }> | [React.FunctionComponent<{
        lexicon: Lexicon;
    }>, Object] | [React.ComponentClass<{
        lexicon: Lexicon;
    }>, Object];
    lexicon: Lexicon;
    allowEditing?: boolean;
    apiUpdateUrl: string;
    apiToken?: string;
    extraHeaders?: {
        [header: string]: string;
    };
    OptionalLogoutButton?: React.FC<any>;
}
declare type EditWrapperChanges = Map<string, {
    originalValue: string;
    newValue: string;
}>;
declare enum SavingState {
    NoChanges = 0,
    Available = 1,
    InProgress = 2,
    Done = 3,
    Error = 4
}
interface EditWrapperState {
    isEditorVisible: boolean;
    lexicon: Lexicon;
    unsavedChanges: EditWrapperChanges;
    savingState: SavingState;
    errorMessage?: string;
    position: 'left' | 'bottom' | 'right';
}
export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
    constructor(props: EditWrapperProps);
    toggleEditor: () => void;
    getToken(): string;
    allowEditing(): boolean;
    updateTextFromEditor: OnChangeCallback;
    switchLocale: (newLocale: string) => void;
    saveChanges: () => void;
    changePosition: (e: React.MouseEvent<HTMLInputElement>) => void;
    render(): JSX.Element;
}
export {};
