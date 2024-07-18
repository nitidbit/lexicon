import React from 'react';
import { Lexicon } from './Lexicon';
import { OnChangeCallback } from './LexiconEditor';
import './EditWrapperStyles.css';
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
    apiUpdateUrl: string;
    allowEditing?: boolean;
    apiToken?: string;
    extraHeaders?: {
        [header: string]: string;
    };
    OptionalLogoutButton?: React.FC<any>;
    children?: any;
}
type EditWrapperChanges = Map<string, {
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
    editorWidth: number;
    editorHeight: number;
}
export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
    constructor(props: EditWrapperProps);
    grabLexiconServerTokenAndReload(): void;
    toggleEditor: () => void;
    getToken(): string;
    allowEditing(): boolean;
    updateTextFromEditor: OnChangeCallback;
    switchLocale: (newLocale: string) => void;
    saveChanges: () => void;
    changePosition: (e: React.MouseEvent<HTMLInputElement>) => void;
    startResizing: (e: React.MouseEvent) => void;
    resize: (e: MouseEvent) => void;
    stopResizing: () => void;
    render(): React.JSX.Element;
}
export {};