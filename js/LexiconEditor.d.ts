/// <reference types="react" />
import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';
export declare type ContentChangeCallback = (contentKey: string, newValue: string) => void;
export declare type SwitchLocaleCallback = (newLocale: string) => void;
export interface LexiconEditorProps {
    lexicon: Lexicon;
    onChange: ContentChangeCallback;
    selectedLocale: string;
    switchLocale: SwitchLocaleCallback;
}
export declare const LexiconEditor: ({ lexicon, onChange, selectedLocale, switchLocale }: LexiconEditorProps) => JSX.Element;
