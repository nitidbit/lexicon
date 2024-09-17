import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { Lexicon, EditWrapper } from '@nitidbit/lexicon';
import { LxEditPanelExample } from "./LxEditPanelExample"
import "./DemoComponent.scss";

import demoStrings from "./DemoComponent.json";
const demoLexicon = new Lexicon(demoStrings)

const isInEditMode = false

type FaqList = [ { question: String, answer: String } ]

function Faq({ faqList, lexicon }) {
  if (isInEditMode) {
    return (
      <div className="Faq">
      {
        faqList.map( ({question, answer}, i) => (
          <Fragment key={ question }>
            <div className="question">
              { question }
            </div>
            <div className="answer" {...lexicon.clicked(`faq.${i}.answer`, isInEditMode)}> 
              { answer }
            </div>
          </Fragment>
        ))
      }
      </div>
    )
  }
  return (
    <div className="Faq">
    {
      faqList.map( ({question, answer}, i) => (
        <Fragment key={ question }>
          <div className="question">
            { question }
          </div>
          <div className="answer"> 
            { answer }
          </div>
        </Fragment>
      ))
    }
    </div>
  )
}

function DemoComponent({lexicon}) {
  const twainLexicon = lexicon.subset('quotes.twain')
  return (
    <div className="DemoComponent">
      { lexicon.get('title', {appName: 'blah'} ) }
      <Faq faqList={lexicon.get('faq')} lexicon={lexicon} />
      <div><p {...twainLexicon.clicked('san_francisco_summer')}>{ twainLexicon.get('san_francisco_summer') }</p></div>
      <br />
    </div>
  )
}

const UPDATE_URL = "update"

function EditableDemoComponent(props) {
  return (
    <EditWrapper
      lexicon={ demoLexicon }
      apiUpdateUrl={ UPDATE_URL }
      component={DemoComponent}
    />
  )
}

document.addEventListener("DOMContentLoaded", () => {
  createRoot(document.querySelector(".placeholder-DemoComponent"))
    .render(EditableDemoComponent())

  createRoot(document.querySelector(".placeholder-LxEditPanelExample"))
    .render(LxEditPanelExample())
})
