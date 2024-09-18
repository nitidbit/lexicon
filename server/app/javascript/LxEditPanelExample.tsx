import React, { Fragment } from "react";
import { useLexicon, LxProvider } from '@nitidbit/lexicon';
import "./DemoComponent.scss";

import demoStrings from "./DemoComponent.json";

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

function ExampleComponent({}) {
  const demoLexicon = useLexicon(demoStrings)
  return (
    <div className="ExampleComponent">
      { demoLexicon.get('title', {appName: 'blah'} ) }
      <Faq faqList={demoLexicon.get('faq')} />
    </div>
  )
}

const UPDATE_URL = "update"

export function LxEditPanelExample() {
  return (
    <div>
      <LxProvider apiUpdateUrl={ UPDATE_URL }>
        <ExampleComponent/>
      </LxProvider>
    </div>
  )
}
