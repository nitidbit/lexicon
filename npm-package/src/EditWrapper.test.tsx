import React from 'react'
import '@testing-library/jest-dom'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Lexicon } from './Lexicon'
import EditWrapper from './EditWrapper'
import { getURLParameter } from './util'

jest.mock('./util', () => ({
  getURLParameter: () => ("SAMPLE_LEXICON_SERVER_TOKEN")
}))

const isLexiconEditorVisible = (screen) => {

  const editor = screen.container.querySelector('.wrapped-lexicon-editor')
  if (!editor) throw ('could not find editor')
  return !!screen.container.querySelector('.wrapped-lexicon-editor.is-visible')
}

describe('EditWrapper', () => {

  describe('saveChanges()', () => {
    const SampleComponent = () => (<div className="SampleComponent"> Sample </div>)
    const sampleLexicon = new Lexicon({repoPath: "??", en: {blah: 'BLAH'}})

    const renderScreen = (props={}) => {
    return render(
      <EditWrapper
        component={ SampleComponent }
        lexicon={ sampleLexicon }
        apiUpdateUrl='example.com/update'
        {...props}
      ></EditWrapper> )
    }

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

  describe('when clicking an editable DOM element:', () => {
    let user, screen

    const sampleLexicon = new Lexicon({repoPath: "??", en: {
      important_key: 'IMPORTANT CONTENT',
      x00: 'x', x01: 'x', x02: 'x', x03: 'x', x04: 'x', x05: 'x', x06: 'x', x07: 'x', x08: 'x', x09: 'x',
      x10: 'x', x11: 'x', x12: 'x', x13: 'x', x14: 'x', x15: 'x', x16: 'x', x17: 'x', x18: 'x', x19: 'x',
      x20: 'x', x21: 'x', x22: 'x', x23: 'x', x24: 'x', x25: 'x', x26: 'x', x27: 'x', x28: 'x', x29: 'x',
      x30: 'x', x31: 'x', x32: 'x', x33: 'x', x34: 'x', x35: 'x', x36: 'x', x37: 'x', x38: 'x', x39: 'x',
    }})

    const SampleComponent = ({lexicon}) => (
      <div className="SampleComponent" data-lexicon='important_key'>
        { lexicon.get('important_key') }
      </div>
    )

    const renderScreen = (props={}) => {
      user = userEvent.setup()
      return render(
        <EditWrapper
          component={ SampleComponent }
          lexicon={ sampleLexicon }
          apiUpdateUrl='example.com/update'
          {...props}
        />
      )
    }

    const clickToEdit = async () => {
      Element.prototype.scrollIntoView = jest.fn()
      const sampleComponent = screen.container.querySelector('.SampleComponent') as HTMLElement
      await user.keyboard('[ShiftLeft>]') // Press Shift (without releasing it)
      await user.click(within(sampleComponent).queryByText('IMPORTANT CONTENT'))
    }

    it('opens the editing panel', async () => {
      screen = renderScreen()
      await clickToEdit()
      expect(isLexiconEditorVisible(screen)).toEqual(true)
    })

    test('the input for that element is in view', async () => {
      screen = renderScreen()
      const inputElement = screen.queryByLabelText('important_key')
      // inputElement.scrollIntoView = jest.fn()

      await clickToEdit()
      expect(inputElement.scrollIntoView).toBeCalled()
    })
  //    the input for that element's height is enlarged to see all or most of the text
  //    the input height is not more than 80% of the browser window
  })

})
