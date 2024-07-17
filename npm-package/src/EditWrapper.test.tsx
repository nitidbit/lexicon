import React from 'react'
import '@testing-library/jest-dom'
// import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'

import { Lexicon } from './Lexicon'
import EditWrapper from './EditWrapper'
import { getURLParameter } from './util'

jest.mock('./util', () => ({
  getURLParameter: () => ("SAMPLE_LEXICON_SERVER_TOKEN")
}))

const SampleComponent = () => (<div className="SampleComponent"> Sample </div>)
const sampleLexicon = new Lexicon({en: {blah: 'BLAH'}}, 'en', '??')

const renderScreen = (props={}) => {
  return render(
    <EditWrapper
      component={ SampleComponent }
      lexicon={ sampleLexicon }
      apiUpdateUrl='example.com/update'
      {...props}
    ></EditWrapper> )
}

describe('EditWrapper', () => {
  describe('saveChanges()', () => {
    it('renders <component>', () => {
      const screen = renderScreen()
      expect(screen.queryByText('Sample')).toBeInTheDocument()
    })

    it('has the Edit Lexicon button', async () => {
      const screen = renderScreen()
      // screen.debug()
      expect(await screen.findByText('Edit Lexicon')).toBeInTheDocument()
    })

    it('shows useful error when server returns json formatted error response', () => {
      // allowEditing={true} // opens the edit panel
    })
  })
})
