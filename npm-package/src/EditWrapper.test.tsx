import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

    it('has the Edit Lexicon button', () => {
      const screen = renderScreen()
      // screen.debug()
      expect(screen.queryByText('Edit Lexicon')).toBeInTheDocument()
    })

    const simulateEditAndSave = async () => {
      const user = userEvent.setup()
      const screen = renderScreen()

      await user.click(screen.getByLabelText('blah'))
      await user.keyboard('BLARGH')
      await user.click(screen.getByText('Save changes'))

      return screen
    }

    it('shows useful message when there is a network level problem (no wifi, cors)', async () => {
      global.fetch = jest.fn(() => {
          return Promise.reject(new TypeError('MOCK NETWORK ERROR'))
        }
      ) as any

      const screen = await simulateEditAndSave()

      expect(screen.getByText(/MOCK NETWORK ERROR/)).toBeInTheDocument()
    })

    it('shows useful error when server returns json formatted error response', async () => {
      const RESPONSE = {
        succcess: false,
        error: "something went wrong",
      }
      global.fetch = jest.fn(() => Promise.resolve(
        { json: () => Promise.resolve(RESPONSE) }
      )) as any

      const screen = await simulateEditAndSave()
      expect(screen.getByText(/something went wrong/)).toBeInTheDocument()
    })
  })

})
