console.info("Loading: server/app/javascript/DemoComponent.tsx")

import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
// import { Lexicon, EditWrapper } from '@nitidbit/lexicon';
import { Lexicon, EditWrapper } from '../../../npm-package/src';

console.log('editwrapper=', EditWrapper)


import "./DemoComponent.scss";
import demoStrings from "./DemoComponent.json";

const demoLexicon = new Lexicon(demoStrings, "en", "server/app/javascript/DemoComponentStrings.json")

console.log("DEMOSTRINGS", demoStrings)
console.log('faq=', demoLexicon.get('faq'))

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
      Demo Component
      { /*
      <EditWrapper lexicon={demoLexicon}
        apiUpdateUrl="http://localhost:3000/update"
      >
      */ }
        <Faq faqList={demoLexicon.get('faq')} />
      { /*
      </EditWrapper>
      */ }
    </div>
  )
}

// const WrappedDemoComponent = EditWrapper(component=

document.addEventListener("DOMContentLoaded", () => {
  createRoot(document.querySelector(".placeholder-DemoComponent"))
    .render(DemoComponent())
})
