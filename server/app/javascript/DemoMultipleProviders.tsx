import React, { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './DemoMultipleProviders.scss'

import { useLexicon, LxProvider, LxTag } from '@nitidbit/lexicon'
import demoStrings from './DemoComponent.json'

function Quotations() {
  const lex = useLexicon(demoStrings)

  return (
    <div className="Quotations component">
      { lex.get('title', {appName: "Quotations"}) }
      <Shakespeare />
      <Twain />
    </div>
  )
}

function Shakespeare() {
  const lex = useLexicon(demoStrings)

  return (
    <div className="Shakespeare component">
      { lex.get('quotes.shakespeare.to_be') }
    </div>
  )
}

function Twain() {
  const lex = useLexicon(demoStrings)

  return (
    <div className="Twain component">
      { lex.get('quotes.twain.san_francisco_summer') }
    </div>
  )
}

const UPDATE_URL = 'demo'

export function DemoMultipleProviders() {
  return (
    <div className="DemoMultipleProviders component">
      <LxProvider apiUpdateUrl={UPDATE_URL} >
        <Quotations />
      </LxProvider>
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.querySelector(".placeholder-DemoComponent"))
    .render(DemoMultipleProviders())
})
