import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Lexicon } from "../index"
import { LexiconHub } from "./LexiconHub"
import { LxEditPanel } from "./LxEditPanel"

describe('<LxEditPanel>', () => {
  let lexiconHub: LexiconHub
  let setLexiconHub: (l: LexiconHub) => void

  const testSubject = (overrideProps={}) => {
    return render(
      <LxEditPanel
        visible={true}
        lexiconHub={lexiconHub}
        setLexiconHub={setLexiconHub}
        lexiconServerToken="FAKE_TOKEN"
        apiUpdateUrl="FAKE_URL"
        toggleEditPanel={jest.fn()}
        {...overrideProps}
      />
    )
  }

  beforeEach(() => {
    lexiconHub = new LexiconHub({
      repoPath: 'sample.json',
      en: { greeting: 'hello', valediction: 'bye' },
      es: { greeting: 'hola', valediction: 'adios' },
      haw: { greeting: 'aloha', valedition: 'aloha-also' }
    }, "en")

    setLexiconHub = jest.fn()
  })

  it('shows locale radio buttons for the LexiconHubs locale', async () => {
    const screen = testSubject()

    expect(screen.queryByLabelText('en')).toBeInTheDocument()
    expect(screen.queryByLabelText('es')).toBeInTheDocument()
    expect(screen.queryByLabelText('haw')).toBeInTheDocument()
  })

  it("shows content for the hub's current Locale", async () => {
    const screen = testSubject({
      lexiconHub: lexiconHub.locale('haw')
    })

    expect(screen.queryByText('aloha')).toBeInTheDocument()
    expect(screen.queryByText('hello')).not.toBeInTheDocument()
    expect(screen.queryByText('hola')).not.toBeInTheDocument()
  })

  describe('when editing some text and Saving', () => {
    const editGreeting = async (response = { successful: true, error: null }) => {
      const screen = testSubject()

      global.fetch = jest.fn(
          () => Promise.resolve({ json: () => Promise.resolve(response) })
      ) as jest.Mock

      await userEvent.type(screen.getByLabelText("greeting"), "Good day sir")
      return screen
    }

    afterEach( () => {
      global.fetch = undefined
    })

    it('sends the changes to Lexicon Server', async () => {
      const screen = await editGreeting()
      await userEvent.click(screen.getByText("Save changes"))
      expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1)
    })

    it('when selecting an input element in the editor it resizes if needed', async () => {
      // jest cannot get the actual height which depends on scrollHeight and is only 
      // available in the browser, so just test that the expandedStyle method
      // gets called with the right parameters
      const spy = jest.spyOn(require('./LexiconEditor'), 'expandedStyle');
      const screen = testSubject()
      const selectedInputField = screen.queryAllByText('hello')[0]
      await userEvent.click(selectedInputField)
      expect(spy).toHaveBeenCalledWith(true, {current: selectedInputField})
      spy.mockRestore()
    })

    it('when selecting an input element the background is highlighted', async () => {
      const screen = testSubject()
      const firstSelectedInputField = screen.queryAllByText('hello')[0]
      await userEvent.click(firstSelectedInputField)
      expect(firstSelectedInputField.style.background).toEqual("rgb(255, 255, 221)")
    })

    it('when a second input element is selected the previously selected element is no longer highlighted', async () => {
      const screen = testSubject()
      const firstSelectedInputField = screen.queryAllByText('hello')[0]
      await userEvent.click(firstSelectedInputField)
      const secondSelectedInputField = screen.queryAllByText('bye')[0]
      await userEvent.click(secondSelectedInputField)
      expect(firstSelectedInputField.style.background).toEqual("")
    })

    it('shows saving status', async () => {
      const screen = await editGreeting()

      // after editing, the save button is active
      expect(screen.queryByText('Save changes')).toBeInTheDocument()

      await userEvent.click(screen.getByText("Save changes"))

      // Then indicates completion
      expect(screen.queryByText('Saved!')).toBeInTheDocument()
    })

    it('shows errors from the server to the user', async () => {
      const screen = await editGreeting({ successful: false, error: 'BLAH' })
      await userEvent.click(screen.getByText("Save changes"))

      // The server error is shown to user
      expect(screen.queryByText('BLAH')).toBeInTheDocument()

      // The save button is still active since the save failed
      expect(screen.queryByText('Save changes')).toBeInTheDocument()
    })
  })

  // clicking Right Position button moves panel to right side
  // clicking Bottom Position button moves panel to bottom
  // dragging the edge of panel will resize the panel
})
