import React, { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './DemoComponent.scss'

import { useLexicon, LxProvider } from '@nitidbit/lexicon'
import demoStrings from './DemoComponent.json'

type FaqList = [{ question: String; answer: String; lexicon: object }]

function LxSpan({ lexicon, keyPath, vars={}, ...otherProps }) {
  const text = lexicon.get(keyPath, vars)
  const clickToEdit = lexicon.clicked(keyPath)
  return (
    <span {...clickToEdit} {...otherProps} >
      { text }
    </span>
  )
}

function Faq({ faqList, lexicon }) {
  return (
    <div className="Faq">
      {faqList.map(({ question, answer }, i) => (
        <Fragment key={question}>
          <div className="question">{question}</div>
          <div className="answer" {...lexicon.clicked(`faq.${i}.answer`)}>
            {answer}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function DemoComponent({ localeCode }) {
  let demoLexicon = useLexicon(demoStrings, localeCode)
  let twainLexicon = demoLexicon.subset('quotes.twain')
  let shakespeareLexicon = demoLexicon.subset('quotes.shakespeare')

  return (
    <div className="DemoComponent">
      <a href="?locale=en">English</a> | <a href="?locale=es">Spanish</a>
      <br />
      <br />
      <LxSpan lexicon={demoLexicon} keyPath='title' vars={{ appName: 'My Favorite Things' }} />
      <Faq faqList={demoLexicon.get('faq')} lexicon={demoLexicon} />

      <p>
        <LxSpan lexicon={demoLexicon} keyPath='quotes.twain.san_francisco_summer' />
      </p>
      <p>
        <LxSpan lexicon={demoLexicon} keyPath='quotes.shakespeare.to_be' />
      </p>
    </div>
  )
}

const UPDATE_URL = 'demo'
const badDemoApp = () => {
  const lex = useLexicon(demoStrings, 'en')
  return (
    <LxProvider apiUpdateUrl="">
      { lex.get('faq') }
    </LxProvider>
  )
}

export function DemoApp() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const localeCode = urlParams.get('locale') === 'es' ? 'es' : 'en'
  return (
    <div>
      <LxProvider apiUpdateUrl={UPDATE_URL} localeCode={localeCode}>
        <DemoComponent localeCode={localeCode} />
      </LxProvider>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.querySelector(".placeholder-DemoComponent"))
    .render(DemoApp())
})
