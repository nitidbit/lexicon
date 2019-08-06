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
    lexicon: Lexicon;
}
export default class EditWrapper extends React.Component<EditWrapperProps, EditWrapperState> {
    constructor(props: EditWrapperProps);
    toggleEditor: () => void;
    allowEditing(): boolean;
    updateText: (contentKey: string, newValue: string) => void;
    switchLocale: (newLocale: string) => void;
    render(): JSX.Element;
}
export {};
