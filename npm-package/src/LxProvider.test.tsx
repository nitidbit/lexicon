import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { getURLParameter } from './util'

import { LxProvider, Lexicon, useLexicon } from './index'

jest.mock('./util')

describe('<LxProvider>', () => {
  let lexicon: Lexicon

  const SampleApp = () => {
    lexicon = useLexicon({ repoPath: 'blah.json', en: {banner: "I <3 CATS" } })

    return (
      <div className="SampleApp">
        { lexicon.get('banner') }
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
})
