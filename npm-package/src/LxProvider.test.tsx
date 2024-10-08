import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { getURLParameter } from './util'

import { LxProvider, Lexicon, useLexicon } from './index'

jest.mock('./util')

describe('<LxProvider>', () => {
  let lexicon: Lexicon

  const bigLexicon = {
    repoPath: 'foo.json',
    en: {
      "title": "English Title",
      "quotes": {
        "shakespeare": {
          "to_be": "to be or not to be, that is the question"
        },
        "twain": {
          "san_francisco_summer": "the coldest winter I ever spent was a summer in san francisco"
        }
      },
    },
    es: {
      "title": "Spanish Title",
      "quotes": {
      "shakespeare": {
        "to_be": "ser o no ser, esa es la cuestión"
      },
      "twain": {
        "san_francisco_summer": "El invierno más frío que he pasado fue un verano en San Francisco."
      }
    }
  }
}

  const SampleApp = ({localeCode='en'}) => {
    lexicon = useLexicon({ repoPath: 'blah.json', en: {banner: "I <3 CATS" }, es: {banner: 'YO <3 LOS GATOS'}, localeCode: localeCode })

    return (
      <div className="SampleApp">
        { lexicon.get('banner') }
      </div>
    )
  }

  const SampleSubsetApp = () => {
    lexicon = useLexicon(bigLexicon)

    return (
      <div className="SubsetSampleApp">
        <p {...lexicon.subset("quotes.twain").clicked("san_francisco_summer")} >
          { lexicon.subset("quotes.twain").get("san_francisco_summer")}
        </p>
      </div>
    )
  }

  const testSubject = (token = 'SAMPLE SERVER TOKEN') => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL">
        <SampleApp/>
      </LxProvider>
    )
  }

  const testSubsetSubject = (token = 'SAMPLE SERVER TOKEN') => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL">
        <SampleSubsetApp/>
      </LxProvider>
    )
  }

  const testSpanishSubject = (token = 'SAMPLE SERVER TOKEN', localeCode = 'es') => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL" localeCode={localeCode}>
        <SampleApp localeCode={localeCode} />
      </LxProvider>
    )
  }

  describe('when editor changes a value', () => {
    test('components that use Lexicon will render the new value', async () => {
      const screen = testSubject()

      const sampleAppElem = screen.container.querySelector('.SampleApp') as HTMLElement
      expect(within(sampleAppElem).queryByText('I <3 CATS')).toBeInTheDocument()

      // edit some content
      await userEvent.click(screen.queryByText('Edit Lexicon'))
      const bannerInput = screen.queryByLabelText('blah_json.banner')
      await userEvent.clear(bannerInput)
      await userEvent.type(bannerInput, 'I <3 TREES')

      expect(within(sampleAppElem).queryByText('I <3 CATS')).not.toBeInTheDocument()
      expect(within(sampleAppElem).queryByText('I <3 TREES')).toBeInTheDocument()
    })
  })

  describe('when lexiconServerToken is in URL', () => {
    beforeEach(() => {
      (getURLParameter as jest.Mock).mockImplementationOnce((name) => 'SAMPLE_TOKEN' )

      testSubject(/*dont set sessionStorage:*/null)
    })

    it('stores token for later', () => {
      expect(sessionStorage.getItem('lexiconServerToken')).toEqual('SAMPLE_TOKEN')
    })

    xit('reloads the browser so token is no longer in URL', () => {})

    it('renders the Lexicon Edit button', () => {
      expect(screen.queryByRole('button', { name: 'Nothing to Save'})).toBeInTheDocument()
    })
  })

  describe('when there is no token', () => {
    beforeEach(() => {
      sessionStorage.clear()
      expect(sessionStorage.getItem('lexiconServerToken')).toEqual(null)
      testSubject(/*dont set sessionStorage:*/null)
    })

    it('does not render Edit Lexicon button', () => {
      expect(screen.queryByRole('button', { name: 'Nothing to Save'})).not.toBeInTheDocument()
    })
  })

  describe('when editor is opened with shift-click on a field', () => {
    beforeAll(() => {
      Element.prototype.scrollIntoView = jest.fn();
    })

    it('opens the editor', async () => {
      const screen = testSubsetSubject();
      const subsetSampleApp = screen.container.querySelector('.SubsetSampleApp') as HTMLElement
      expect(screen.container.querySelector('.LxEditPanel.is-visible')).not.toBeInTheDocument()
      const fieldToEdit = within(subsetSampleApp).queryByText('the coldest winter I ever spent was a summer in san francisco')
      const sampleAppEditPanel = screen.container.querySelector('.LxEditPanel') as HTMLElement
      await waitFor(() => {
        expect(sampleAppEditPanel).not.toHaveClass('is-visible');
      });

      const shiftClickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        shiftKey: true, // This simulates holding down Shift during the click
      });
  
      // Dispatch the click event on the field
      fieldToEdit?.dispatchEvent(shiftClickEvent);
      await waitFor(() => {
        expect(sampleAppEditPanel).toHaveClass('is-visible');
      });
    })

    it('expands the correct field in the editor', async () => {
      const spy = jest.spyOn(require('./editor/LexiconEditor'), 'expandedStyle')
      const screen = testSubsetSubject();
      const editor = screen.container.querySelector('.LxEditPanel') as HTMLElement
      const fieldToEdit = within(editor).queryByText('the coldest winter I ever spent was a summer in san francisco')
      const shiftClickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        shiftKey: true, // This simulates holding down Shift during the click
      });
  
      // Dispatch the click event on the field
      fieldToEdit?.dispatchEvent(shiftClickEvent);
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(true, {current: fieldToEdit});
      });
    })
  })

  describe('when editor opened in spanish', () => {
    test('it renders spanish', async () => {
      const screen = testSpanishSubject()

      const sampleAppEditPanel = screen.container.querySelector('.LxEditPanel') as HTMLElement
      expect(within(sampleAppEditPanel).queryByText('YO <3 LOS GATOS')).toBeInTheDocument()
    })
  })

  describe('when using a subset of a lexicon', () => {
    test('it renders lexicon content correctly', async () => {
      const screen = testSubsetSubject()

      const subsetSampleApp = screen.container.querySelector('.SubsetSampleApp') as HTMLElement
      expect(within(subsetSampleApp).queryByText('the coldest winter I ever spent was a summer in san francisco')).toBeInTheDocument()
    })
  })
})
