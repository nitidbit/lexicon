import React from 'react';
import { LexiconShape } from './Lexicon';
import '../styles/EditWrapperStyles.scss';
declare type EditWrapperProps = {
    component: React.FunctionComponent<{
        lexicon: any;
    }> | React.ComponentClass<{
        lexicon: any;
    }, any>;
    lexicon: any;
    lexiconShape: LexiconShape;
    allowEditing?: boolean;
    apiUpdateUrl: string;
    apiToken?: string;
};
declare type EditWrapperState = {
    isEditorVisible: boolean;
    lexicon: any;
    isSaving: boolean;
    unsavedChanges: {
        filename: string;
        key: string;
        newValue: string;
    }[];
    errorMessage?: string;
    justSaved: boolean;
};
declare class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
    constructor(props: EditWrapperProps);
    getToken(): string;
    allowEditing(): boolean;
    toggleEditor: () => void;
    render(): JSX.Element;
    updateText: (contentKey: string, newValue: string) => void;
    saveChanges: () => void;
}
export default EditWrapper;
