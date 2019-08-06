import React from 'react';
import { Lexicon } from './Lexicon';
import '../styles/EditWrapperStyles.scss';
interface EditWrapperProps {
    component: React.FunctionComponent<{
        lexicon: Lexicon;
    }> | React.ComponentClass<{
        lexicon: Lexicon;
    }>;
    lexicon: Lexicon;
    allowEditing?: boolean;
}
interface EditWrapperState {
    isEditorVisible: boolean;
}
export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
    constructor(props: EditWrapperProps);
    toggleEditor: () => void;
    allowEditing(): boolean;
    updateText(): void;
    render(): JSX.Element;
}
export {};
