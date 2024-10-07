import React, { Fragment } from 'react'
import { useLexicon, LxProvider } from '@nitidbit/lexicon'
import './DemoComponent.scss'
import demoStrings from './DemoComponent.json'

type FaqList = [{ question: String; answer: String; lexicon: object }]

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

function ExampleComponent({ localeCode }) {
  let demoLexicon = useLexicon(demoStrings, localeCode)
  let twainLexicon = demoLexicon.subset('quotes.twain')
  let shakespeareLexicon = demoLexicon.subset('quotes.shakespeare')

  return (
    <div className="ExampleComponent">
      <a href="?locale=en">English</a> | <a href="?locale=es">Spanish</a>
      <br />
      <br />
      {demoLexicon.get('title', { appName: 'My Favorite Things' })}
      <Faq faqList={demoLexicon.get('faq')} lexicon={demoLexicon} />
      <div>
        <p {...twainLexicon?.clicked('san_francisco_summer')}>
          {twainLexicon?.get('san_francisco_summer')}
        </p>
        <p {...shakespeareLexicon?.clicked('to_be')}>
          {shakespeareLexicon?.get('to_be')}
        </p>
      </div>
    </div>
  )
}

const UPDATE_URL = 'update'

export function LxEditPanelExample() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const localeCode = urlParams.get('locale') === 'es' ? 'es' : 'en'
  return (
    <div>
      <LxProvider apiUpdateUrl={UPDATE_URL} localeCode={localeCode}>
        <ExampleComponent localeCode={localeCode} />
      </LxProvider>
    </div>
  )
}
