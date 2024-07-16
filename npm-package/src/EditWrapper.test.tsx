import React from 'react'
import '@testing-library/jest-dom'
// import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'

import { Lexicon } from './Lexicon'
import EditWrapper from './EditWrapper'


const SampleComponent = () => (<div className="SampleComponent"> Sample </div>)
const sampleLexicon = new Lexicon({en: {blah: 'BLAH'}}, 'en', '??')

const renderScreen = () => (
  render(
    <EditWrapper
      component={ SampleComponent }
      lexicon={ sampleLexicon }
      apiUpdateUrl='example.com/update'
      allowEditing={true}
    ></EditWrapper> )
)

describe('EditWrapper', () => {
  describe('saveChanges()', () => {
    it('renders <component>', () => {
      const screen = renderScreen()
      expect(screen.queryByText('Sample')).toBeInTheDocument()
    })
  })
})
