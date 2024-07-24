import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { LxProvider, Lexicon, useLexicon } from './index'

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

  const testSubject = () => {
    sessionStorage.setItem('lexiconServerToken', 'SAMPLE SERVER TOKEN')
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

  // when lexiconServerToken is in URL:
    // stores token for later
    // reloads the browser
  // when there is no token: does not render Edit Lexicon button
  // when token was passed: renders Edit Lexicon button
})
