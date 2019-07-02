import * as React from "react";
import _ from 'lodash';

import '../styles/LexiconEditorStyles.scss';
import {LexiconShape} from './Lexicon';
import * as Text from './Lexicon';

export type ContentOnChangeCallback = (contentKey:Text.DottedKey, newValue:any) => void;

type HtmlOnChangeCallback = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
interface EditorProps { contentKey: Text.DottedKey,
                        value: any,
                        onChange: HtmlOnChangeCallback};

function FormRow(props: {label:string, children:any}) {
  return (
    <div id="FormRow">
      <label title={props.label}>
        <span className="label">
          { props.label }
        </span>
        { props.children }
      </label>
    </div>
  );
};


//
// Editors
//

const ShortString = function(props: EditorProps) {
  return (
    <input type="text" id="ShortString"
      name={props.contentKey}
      defaultValue={props.value}
      onChange={props.onChange} />
  );
};

function LongString(props: EditorProps) {
  return (
    <textarea id="LongString" name={props.contentKey} defaultValue={props.value} onChange={props.onChange} />
  );
}

function QuestionAndAnswerEditor(props: EditorProps) {
  let questionKey = props.contentKey + '.question';
  let answerKey = props.contentKey + '.answer';
  return (
    <div id="QuestionAndAnswerEditor">

      <ShortString contentKey={questionKey}
        value={props.value.question}
        onChange={props.onChange} />

      <LongString contentKey={answerKey}
        value={props.value.answer}
        onChange={props.onChange} />
    </div>
  );
}

function QuestionAndAnswerCollection(props: EditorProps) {
  let innerValues = props.value;
  let innerProps = _.omit(props, ['value', 'contentKey']);

  return (
    <div id="QuestionAndAnswerCollection">
      {
        innerValues.map( (questionAndAnswer:any, index:number) => {
          let innerContentKey = props.contentKey + `.${index}`;
          return (
            <div className="innerEditorBox" key={questionAndAnswer.question} >
              <div className="numberTab"> { index } </div>
              <QuestionAndAnswerEditor value={questionAndAnswer} contentKey={innerContentKey} {...innerProps} />
            </div>
          );
        })
      }
    </div>
  );
};

const INPUT_EDITORS:any = Object.freeze({
  LongString,
  ShortString,
  QuestionAndAnswerEditor,
  QuestionAndAnswerCollection,
});


function UnknownInputType(LexiconShape: LexiconShape) {
  let unknownEditorComponent = function(props: EditorProps) {
    return (
      <div id="UnknownInputType">
        (Unknown input type: { LexiconShape.name() })
      </div>
    );
  }

  return unknownEditorComponent;
}


const editorForType = function( LexiconShape:LexiconShape,
                                contentKey:Text.DottedKey,
                                value:any,
                                onChange:HtmlOnChangeCallback) {
  let inputComponent = INPUT_EDITORS[LexiconShape.name()] || UnknownInputType(LexiconShape);

  return (
    <FormRow key={contentKey} label={contentKey}>
      { React.createElement(inputComponent, {contentKey, value, onChange} ) }
    </FormRow>);
};


function LexiconEditor(props: {flatShape:object, lexicon:any, onChange:ContentOnChangeCallback}) {

  let sendLexiconEditorChange:HtmlOnChangeCallback = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let contentKey = event.target.name;
    let newValue = event.target.value;
    props.onChange(contentKey, newValue);
  };

  return (
    <div id="LexiconEditor">
      <h2> Content Editor </h2>
      {
        _.map(props.flatShape, (row) => {
          let contentKey = row[0] as Text.DottedKey;
          let inputType = row[1] as Text.LexiconShape;
          let theLemma = _.get(props.lexicon, contentKey);
          return editorForType(inputType, contentKey, theLemma, sendLexiconEditorChange);
        })
      }
    </div>);
}

export default LexiconEditor;
