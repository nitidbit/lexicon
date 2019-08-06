/// <reference types="react" />
import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';
export declare type ContentOnChangeCallback = (contentKey: string, newValue: string) => void;
export declare type SwitchLocaleCallback = (newLocale: string) => void;
export interface LexiconEditorProps {
    lexicon: Lexicon;
    onChange: ContentOnChangeCallback;
    selectedLocale: string;
    switchLocale: SwitchLocaleCallback;
}
declare const LexiconEditor: ({ lexicon, onChange, selectedLocale, switchLocale }: LexiconEditorProps) => JSX.Element;
export default LexiconEditor;
