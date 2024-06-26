import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { Lexicon, EditWrapper } from '../../../npm-package/src';
import "./DemoComponent.scss";
import demoStrings from "./DemoComponent.json";

const demoLexicon = new Lexicon(demoStrings, "en", "server/app/javascript/DemoComponentStrings.json")

type FaqList = [ { question: String, answer: String } ]

function Faq({ faqList }) {
  return (
    <div className="Faq">
    {
      faqList.map( ({question, answer}) => (
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


function DemoComponent() {
  return (
    <div className="DemoComponent">
      { demoLexicon.get('title', {appName: 'blah'} ) }
      <Faq faqList={demoLexicon.get('faq')} />
    </div>
  )
}

const UPDATE_URL = "localhost:3000/update"

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
