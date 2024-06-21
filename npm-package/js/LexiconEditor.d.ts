import React from 'react';
import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';
import { KeyPath, KeyPathString } from './collection';
export type OnChangeCallback = (change: {
    filename: string;
    localPath: KeyPathString;
    updatePath: KeyPath;
    newValue: string;
}) => void;
export type SwitchLocaleCallback = (newLocale: string) => void;
export interface LexiconEditorProps {
    lexicon: Lexicon;
    onChange: OnChangeCallback;
    selectedLocale: string;
    switchLocale: SwitchLocaleCallback;
}
export declare class LexiconEditor extends React.Component<LexiconEditorProps, {}> {
    sendLexiconEditorChange: (event: any) => void;
    render(): React.JSX.Element;
}
