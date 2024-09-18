import lodash_fp from 'lodash/fp'
import { KeyPath } from '../collection';
import * as col from '../collection';
import { Lexicon, ContentByLocale, LocaleCode, DEFAULT_LOCALE_CODE } from '../Lexicon'


export class LexiconHub extends Lexicon {

  constructor(
    contentByLocale: ContentByLocale = {repoPath: 'SHARED LEXICON HUB', en: {}, es: {}},
    localeCode: LocaleCode = DEFAULT_LOCALE_CODE,
    subset: KeyPath = ''
  ){
    super(contentByLocale, localeCode, subset)
  }

  register(
    contentByLocale: ContentByLocale,
    localeCode: LocaleCode = DEFAULT_LOCALE_CODE
  ): Lexicon {
    const existingLexicon = this.lexiconWithRepoPath(contentByLocale.repoPath)
    if (existingLexicon) return existingLexicon

    const newLexicon = new Lexicon(contentByLocale, localeCode)
    this.addBranch(newLexicon, this.rootKey(newLexicon))
    return newLexicon
  }

  lexiconWithRepoPath(repoPath: string): Lexicon {
    for (const [key, node] of lodash_fp.entries(this._data[DEFAULT_LOCALE_CODE] as col.Collection)) {
      if (node instanceof Lexicon && node.filename() == repoPath) {
        return node
      }
    }
    return null // not found
  }

  //
  //    Private methods
  //

  // Return key that is unique for a particular Lexion.
  private rootKey(lexicon) {
    return lexicon.filename().replace('.', '_') // dots would be confused with key paths
  }

  /* Merge a second 'subLexicon' in under the key 'branchKey'. */
  addBranch(subLexicon: Lexicon, branchKey: string): void {
    for (const locale of this.locales()) {
      this._data[locale][branchKey] = subLexicon.locale(locale);
    }
  }
}

