import React from 'react'
import { render, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LxProvider, Lexicon, useLexicon, LxTag } from './index'

describe('<LxTag>', () => {
  let lexicon: Lexicon

  const testSubject = (token = 'SAMPLE SERVER TOKEN', localeCode = 'en') => {
    if (token) {
      sessionStorage.setItem('lexiconServerToken', token)
    }

    return render(
      <LxProvider apiUpdateUrl="SAMPLE_URL">
        <SampleApp localeCode={localeCode} />
      </LxProvider>
    )
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

    return (
      <div className="SampleApp">
        {lexicon.get('banner')}
        <LxTag tagName="div">
          test
        </LxTag>
      </div>
    ) 
  }

  describe('when LxTag is used', () => {
    test('the tag rendered is the tag specified in the tag attribute', () => {
      const screen = testSubject()
      const sampleAppElem = screen.container.querySelector(
        '.SampleApp'
      ) as HTMLElement
      const div = sampleAppElem.querySelector('div');
      expect(div).toBeInTheDocument();
    })
  })

})
