/// <reference types="react" />
import '../styles/LexiconEditorStyles.scss';
import { Lexicon } from './Lexicon';
export declare type ContentOnChangeCallback = (contentKey: string, newValue: any) => void;
declare const LexiconEditor: ({ lexicon, onChange }: {
    lexicon: Lexicon;
    onChange: ContentOnChangeCallback;
}) => JSX.Element;
export default LexiconEditor;
