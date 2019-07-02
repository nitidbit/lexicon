/// <reference types="react" />
import '../styles/LexiconEditorStyles.scss';
import * as Text from './Lexicon';
export declare type ContentOnChangeCallback = (contentKey: Text.DottedKey, newValue: any) => void;
declare function LexiconEditor(props: {
    flatShape: object;
    lexicon: any;
    onChange: ContentOnChangeCallback;
}): JSX.Element;
export default LexiconEditor;
