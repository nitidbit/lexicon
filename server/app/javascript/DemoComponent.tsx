import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { Lexicon, EditWrapper } from '@nitidbit/lexicon'
import "./DemoComponent.scss";
import demoStrings from "./DemoComponent.json";

const demoLexicon = new Lexicon(demoStrings)

type FaqList = [ { question: String, answer: String } ]

function Faq({ faqList }) {
  return (
    <div className="Faq">
    {
      faqList.map( ({question, answer}, i) => (
        <Fragment key={ question }>
          <div className="question">
            { question }
          </div>
          <div className="answer" data-lexicon={`faq.${i}.answer`}>
            { answer }
          </div>
        </Fragment>
      ))
    }
    </div>
  )
}

function DemoComponent({lexicon}) {
  return (
    <div className="DemoComponent">
      { lexicon.get('title', {appName: 'blah'} ) }
      <Faq faqList={lexicon.get('faq')} />
    </div>
  )
}

const UPDATE_URL = "update"

function EditableDemoComponent(props) {
  return (
    <EditWrapper
      lexicon={ demoLexicon }
      apiUpdateUrl={ UPDATE_URL }
      component={ DemoComponent }
    />
  )
}

document.addEventListener("DOMContentLoaded", () => {
  createRoot(document.querySelector(".placeholder-DemoComponent"))
    .render(EditableDemoComponent())
})
