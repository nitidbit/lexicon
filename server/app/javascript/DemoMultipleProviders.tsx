import React, { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './DemoMultipleProviders.scss'

import { useLexicon, LxProvider, LxTag } from '@nitidbit/lexicon'
import demoStrings from './DemoComponent.json'

const UPDATE_URL = 'demo'

function Quotations() {
  const lex = useLexicon(
    { repoPath: 'quotations.json',
      en: { title: '<Quotations> Component' }
    })

  return (
    <fieldset className="Quotations box">
      <legend>
        <h2> { lex.get('title', {appName: "Quotations"}) } </h2>
      </legend>

      <LxProvider apiUpdateUrl={UPDATE_URL} className="ShakespeareProvider" >
        <Shakespeare />
      </LxProvider>

      <LxProvider apiUpdateUrl={UPDATE_URL} className="TwainProvider" >
        <Twain />
      </LxProvider>
    </fieldset>
  )
}

function Shakespeare() {
  const lex = useLexicon(
    { repoPath: 'shakespeare.json',
      en: { shakespeare: 'To be or not to be, that is the question.' }
    })

  return (
    <fieldset className="Shakespeare box">
      <legend> &lt; Shakespeare &gt; </legend>
      { lex.get('shakespeare') }
    </fieldset>
  )
}

function Twain() {
  const lex = useLexicon(
    { repoPath: 'twain.json',
      en: { quote: 'Good decisions come from experience. Experience comes from making bad decisions.' }
    })

  return (
    <fieldset className="Twain box">
      <legend> &lt; Twain &gt; </legend>
      { lex.get('quote') }
    </fieldset>
  )
}

export function DemoMultipleProviders() {
  return (
    <div className="DemoMultipleProviders box">
      <LxProvider apiUpdateUrl={UPDATE_URL} className="Outer">
        <Quotations />
      </LxProvider>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.querySelector(".placeholder-DemoMultipleProviders"))
    .render(DemoMultipleProviders())
})
