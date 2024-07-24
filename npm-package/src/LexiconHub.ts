import cloneDeepWith from 'lodash/cloneDeepWith';
import { KeyPath } from './collection';
import * as col from './collection';
import { Lexicon, ContentByLocale, LocaleCode, DEFAULT_LOCALE_CODE } from './Lexicon'


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
    for (const [key, node] of col.entries(this._contentByLocale[DEFAULT_LOCALE_CODE] as col.Collection)) {
      if (node instanceof Lexicon && node.filename() == repoPath) {
        return node
      }
    }
    return null // not found
  }

  // Returns new instance, with a value changed.
  set(updatePath: KeyPath, newValue: any): LexiconHub {
    if (!col.has(this, updatePath)) throw new Error(`node ${updatePath} does not exist`)

    // TODO: improve implementation so we aren't making so many copies
    const copy = this.cloneDeep()

    col.set(copy, updatePath, newValue);
    return copy; // success
  }

  cloneDeep(): LexiconHub {
    function customizer(value) {
      if (value instanceof Lexicon) {
        return value.cloneDeep();
      } else if (value instanceof LexiconHub) {
        return value.cloneDeep();
      }
    }
    return new LexiconHub(cloneDeepWith(this._contentByLocale, customizer), this.currentLocaleCode, this._subsetRoot);
  }

  //
  //    Private methods
  //

  // Return key that is unique for a particular Lexion.
  private rootKey(lexicon) {
    return lexicon.filename().replace('.', '_') // dots would be confused with key paths
  }

}

