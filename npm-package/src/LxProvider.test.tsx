import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { getURLParameter } from './util'

import { LxProvider, Lexicon, useLexicon } from './index'

jest.mock('./util', () => ({
  ...jest.requireActual('./util'),
  getURLParameter: jest.fn(),
}))

describe('<LxProvider>', () => {
  let lexicon: Lexicon

  const bigLexicon = {
    repoPath: 'foo.json',
    en: {
      title: 'English Title',
      quotes: {
        shakespeare: {
          to_be: 'to be or not to be, that is the question',
        },
        twain: {
          san_francisco_summer:
            'the coldest winter I ever spent was a summer in san francisco',
        },
      },
    },
    es: {
      title: 'Spanish Title',
      quotes: {
        shakespeare: {
          to_be: 'ser o no ser, esa es la cuestión',
        },
        twain: {
          san_francisco_summer:
            'El invierno más frío que he pasado fue un verano en San Francisco.',
        },
      },
    },
  }

  const SampleApp = ({ localeCode = '' }) => {
    lexicon = useLexicon(
      {
        repoPath: 'blah.json',
        en: { banner: 'I <3 CATS' },
        es: { banner: 'YO <3 LOS GATOS' },
      },
      localeCode
    )

    return <div className="SampleApp">{lexicon.get('banner')}</div>
  }

  const SampleSubsetApp = () => {
    lexicon = useLexicon(bigLexicon)

    return (
      <div className="SubsetSampleApp">
        <p {...lexicon.subset('quotes.twain').clicked('san_francisco_summer')}>
          {lexicon.subset('quotes.twain').get('san_francisco_summer')}
        </p>
      </div>
    )
  }

  const testSubject = (
    token = 'SAMPLE SERVER TOKEN',
    localeCode = 'en',
    lexiconNameToDisplay = undefined
  ) => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider
        apiUpdateUrl="SAMPLE_URL"
        lexiconNameToDisplay={lexiconNameToDisplay}
      >
        <SampleApp localeCode={localeCode} />
      </LxProvider>
    )
  }

  const testSubsetSubject = (token = 'SAMPLE SERVER TOKEN') => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL">
        <SampleSubsetApp />
      </LxProvider>
    )
  }

  const testSpanishSubject = (
    token = 'SAMPLE SERVER TOKEN',
    localeCode = 'es'
  ) => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL" localeCode={localeCode}>
        <SampleApp localeCode={localeCode} />
      </LxProvider>
    )
  }

  test('when editor changes a value, components that use Lexicon will render the new value', async () => {
    const screen = testSubject()

    const sampleAppElem = screen.container.querySelector(
      '.SampleApp'
    ) as HTMLElement
    expect(within(sampleAppElem).queryByText('I <3 CATS')).toBeInTheDocument()

    // edit some content
    await userEvent.click(screen.queryByText('Edit Lexicon'))
    await waitFor(() => {
      expect(document.querySelector('.LxEditPanel')).toBeInTheDocument()
    })
    const bannerInput = screen.queryByLabelText('banner')
    await userEvent.clear(bannerInput)
    await userEvent.type(bannerInput, 'I <3 TREES')

    expect(
      within(sampleAppElem).queryByText('I <3 CATS')
    ).not.toBeInTheDocument()
    expect(within(sampleAppElem).queryByText('I <3 TREES')).toBeInTheDocument()
  })

  describe('lexicon name on edit button', () => {
    test('when lexicon name on edit button is not set, the edit button renders the default name', () => {
      const screen = testSubject('SAMPLE SERVER TOKEN', 'en')
      expect(screen.queryByText('Edit Lexicon')).toBeInTheDocument()
    })
    test('when lexicon name on edit button is set, the edit button renders the proper name', () => {
      const screen = testSubject('SAMPLE SERVER TOKEN', 'en', 'My Lexicon')
      expect(screen.queryByText('Edit My Lexicon')).toBeInTheDocument()
    })
  })

  describe('multiple LxProviders', () => {
    test('when one editor is open, other edit buttons are disabled with tooltip', async () => {
      sessionStorage.setItem('lexiconServerToken', 'SAMPLE SERVER TOKEN')
      const screen = render(
        <>
          <LxProvider
            apiUpdateUrl="SAMPLE_URL"
            lexiconNameToDisplay="Lexicon A"
          >
            <SampleApp />
          </LxProvider>
          <LxProvider
            apiUpdateUrl="SAMPLE_URL"
            lexiconNameToDisplay="Lexicon B"
          >
            <SampleApp />
          </LxProvider>
        </>
      )

      const editButtons = Array.from(
        screen.container.querySelectorAll('.edit-lexicon-btn')
      ) as HTMLButtonElement[]
      expect(editButtons).toHaveLength(2)
      const [buttonA, buttonB] = editButtons
      expect(buttonA).not.toBeDisabled()
      expect(buttonB).not.toBeDisabled()

      await userEvent.click(buttonA)

      await waitFor(() => {
        expect(buttonA).not.toBeDisabled()
        expect(buttonB).toBeDisabled()
        expect(buttonB).toHaveAttribute(
          'data-tooltip',
          'Disabled because you opened editor with another button'
        )
      })

      await userEvent.click(buttonA) // Hide

      await waitFor(() => {
        expect(buttonA).not.toBeDisabled()
        expect(buttonB).not.toBeDisabled()
      })
    })
  })

  describe('guarding against useLexicon without LxProvider', () => {
    describe('when useLexicon is not wrapped inside LxProvider and has no context', () => {
      const contextlessApp = () => {
        lexicon = useLexicon(
          {
            repoPath: 'blah.json',
            en: { banner: 'I <3 CATS' },
            es: { banner: 'YO <3 LOS GATOS' },
          },
          'en'
        )
        return (
          <LxProvider apiUpdateUrl="SAMPLE_URL">
            <div className="SampleApp">{lexicon.get('banner')}</div>
          </LxProvider>
        )
      }

      test('it crashes with a helpful message', () => {
        expect(() => {
          contextlessApp()
        }).toThrow(
          'Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component.'
        )
      })
    })

    describe('when demo is not wrapped inside LxProvider and has no context', () => {
      test('it crashes with a helpful message', () => {
        expect(() => render(<SampleApp />)).toThrow(
          'Lexicon Error: useLexicon does not have the required context. You should be able to fix this by wrapping your useLexicon call inside a LxProvider component.'
        )
      })
    })
  })

  describe('detecting lexiconServerToken', () => {
    describe('when lexiconServerToken is in URL', () => {
      beforeEach(() => {
        ;(getURLParameter as jest.Mock).mockImplementationOnce(
          (name) => 'SAMPLE_TOKEN'
        )

        testSubject(/*dont set sessionStorage:*/ null)
      })

      it('stores token for later', () => {
        expect(sessionStorage.getItem('lexiconServerToken')).toEqual(
          'SAMPLE_TOKEN'
        )
      })

      xit('reloads the browser so token is no longer in URL', () => {})

      it('renders the Lexicon Edit button', () => {
        expect(
          screen.queryByRole('button', { name: /Edit Lexicon/i })
        ).toBeInTheDocument()
      })
    })

    describe('when there is no token', () => {
      beforeEach(() => {
        sessionStorage.clear()
        expect(sessionStorage.getItem('lexiconServerToken')).toEqual(null)
        testSubject(/*dont set sessionStorage:*/ null)
      })

      it('does not render Edit Lexicon button', () => {
        expect(
          screen.queryByRole('button', { name: /Edit Lexicon/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('handling locales', () => {
    test('useLexicon returns a Lexicon with the proper locale', () => {
      const screen = render(
        <LxProvider apiUpdateUrl="SAMPLE_URL">
          <SampleApp localeCode="en" />
          <SampleApp localeCode="es" />
        </LxProvider>
      )

      expect(screen.queryByText('I <3 CATS')).toBeInTheDocument()
      expect(screen.queryByText('YO <3 LOS GATOS')).toBeInTheDocument()
    })

    test('consumer observes the locale in LxProvider; if it changes, consumer re-renders in new locale', () => {
      const screen = render(
        <LxProvider apiUpdateUrl="SAMPLE_URL" localeCode="en">
          <SampleApp />
        </LxProvider>
      )

      expect(screen.queryByText('I <3 CATS')).toBeInTheDocument()

      screen.rerender(
        <LxProvider apiUpdateUrl="SAMPLE_URL" localeCode="es">
          <SampleApp />
        </LxProvider>
      )

      expect(screen.queryByText('I <3 CATS')).not.toBeInTheDocument()
      expect(screen.queryByText('YO <3 LOS GATOS')).toBeInTheDocument()
    })

    test('when editing opens in spanish, the editor renders spanish', async () => {
      const screen = testSpanishSubject()

      await userEvent.click(screen.queryByText('Edit Lexicon'))
      await waitFor(() => {
        expect(document.querySelector('.LxEditPanel')).toBeInTheDocument()
      })
      const editPanel = document.querySelector('.LxEditPanel') as HTMLElement
      expect(
        within(editPanel).queryByText('YO <3 LOS GATOS')
      ).toBeInTheDocument()
    })
  })

  describe('when editor is opened with shift-click on a field', () => {
    beforeAll(() => {
      Element.prototype.scrollIntoView = jest.fn()
    })

    it('opens the editor', async () => {
      // Note: With LxProvider, the LexiconEditor is lazy-loaded and only mounts when the
      // editor is open, so shift-click to open from the page doesn't work. We verify
      // that opening with the button and shift-click to expand a field works.
      const screen = testSubsetSubject()
      await userEvent.click(screen.queryByText('Edit Lexicon'))
      await waitFor(() => {
        expect(document.querySelector('.LxEditPanel')).toBeInTheDocument()
      })
      const subsetSampleApp = screen.container.querySelector(
        '.SubsetSampleApp'
      ) as HTMLElement
      const fieldToEdit = within(subsetSampleApp).queryByText(
        'the coldest winter I ever spent was a summer in san francisco'
      )

      const shiftClickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        shiftKey: true, // This simulates holding down Shift during the click
      })

      // Dispatch the click event on the field - expands/focuses it in the editor
      fieldToEdit?.dispatchEvent(shiftClickEvent)
      await waitFor(() => {
        const panel = document.querySelector('.LxEditPanel')
        expect(panel).toHaveClass('is-visible')
      })
    })

    it('expands the correct field in the editor', async () => {
      const spy = jest.spyOn(require('./editor/LexiconEditor'), 'expandedStyle')
      const screen = testSubsetSubject()
      await userEvent.click(screen.queryByText('Edit Lexicon'))
      await waitFor(() => {
        expect(document.querySelector('.LxEditPanel')).toBeInTheDocument()
      })
      const editor = document.querySelector('.LxEditPanel') as HTMLElement
      const fieldToEdit = within(editor).queryByText(
        'the coldest winter I ever spent was a summer in san francisco'
      )
      expect(fieldToEdit).toBeInTheDocument()

      const shiftClickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        shiftKey: true, // This simulates holding down Shift during the click
      })

      // Dispatch the click event on the field
      fieldToEdit?.dispatchEvent(shiftClickEvent)
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(true, { current: fieldToEdit })
      })
    })
  })
})
