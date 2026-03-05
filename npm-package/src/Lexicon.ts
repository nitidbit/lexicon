import lodash_get from 'lodash/get'
import * as col from './collection'
import { Collection, KeyPath, KeyPathArray, KeyPathString } from './collection'
import { evaluateTemplate, hasAtPath } from './util'

export type ContentByLocale = {
  repoPath?: string
  editorNote?: string
  [localeCode: string]: Collection | string | undefined
}

//
//      LocaleCode & related functions
//
export type LocaleCode = string // e.g. 'en', 'es', 'en_GB', 'zh-Hant'
export const DEFAULT_LOCALE_CODE = 'en'

function isLocaleCode(locale: LocaleCode) {
  return typeof locale === 'string' && locale.length < 10
}

// return the constructor for an instance of a JS class
// from https://stackoverflow.com/questions/62010217/how-to-create-a-new-object-of-same-class-as-current-object-from-within-a-method
const classConstructor = (someInstance) => {
  return someInstance.constructor[Symbol.species] ?? someInstance.constructor
}

//
//      Lexicon — A tree-like container for holding content. Lexicons can hold other Lexicons.
//

export class Lexicon {
  public currentLocaleCode: LocaleCode
  protected _data: ContentByLocale
  protected _subsetRoot: KeyPathArray
  protected _filename: string

  constructor(
    contentByLocale: ContentByLocale,
    localeCode: LocaleCode = DEFAULT_LOCALE_CODE,
    subset: KeyPath = ''
  ) {
    // extract repoPath without causing TypeScript errors
    const contentWithPath = contentByLocale as ContentByLocale & {
      repoPath: string
    }
    if (contentWithPath.repoPath === undefined) {
      throw new Error(
        `'contentByLocale' must contain 'repoPath: 'path/to/content.json'. \ncontentByLocale=\n>>>${JSON.stringify(
          contentWithPath
        )}<<<`
      )
    }
    this._filename = contentWithPath.repoPath

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    if (!this.currentLocaleCode && !localeCode) {
      this.currentLocaleCode = urlParams.get('locale')
        ? urlParams.get('locale')
        : DEFAULT_LOCALE_CODE
    } else {
      this.currentLocaleCode = localeCode
    }
    // ensure content at least has 'en' locale
    if (!hasAtPath(contentByLocale, DEFAULT_LOCALE_CODE)) {
      throw new Error("'contentByLocale' must contain 'en: {...}' locale")
    }

    this._data = contentByLocale
    this._subsetRoot = col.keyPathAsArray(subset)
  }

  //
  //    Methods for use by Lexicon clients
  //

  /* Return a new Lexicon with same contents, but different default language code */
  locale(localeCode: LocaleCode) {
    if (!isLocaleCode(localeCode))
      throw new Error(`'localeCode' should be e.g. 'en', not: ${localeCode}`)

    if (!hasAtPath(this._data, localeCode)) return null

    return new (classConstructor(this))(
      this._data,
      localeCode,
      this._subsetRoot
    )
  }

  /*
     Return a value from the Lexicon, in the current locale.
     If you pass 'templateSubsitutions', and the value is a string or array, then they are inserted,
        e.g.
        // where mykey: "hello #{name}"
        l.get("mykey", {name: "Winston"}) // -> "hello Winston"

        // where mykey: ["Mr #{name}", "Mrs #{name}"]
        l.get("mykey", {name: "Winston"}) // -> ["Mr Winston", "Mrs Winston"]
  */

  clicked(lexiPath: string) {
    if (sessionStorage.lexiconServerToken) {
      return {
        'data-lexicon': this.rootKey(this) + '.' + this.fullKey(null, lexiPath),
      }
    }
    return {}
  }

  get(keyPath: KeyPath, templateSubstitutions?: object): any {
    if (keyPath == null) throw new Error("'keyPath' is null/undefined")

    let info = this.find(this.currentLocaleCode, keyPath)

    if (info == null) {
      if (this.currentLocaleCode !== DEFAULT_LOCALE_CODE) {
        // could not find it--try English
        info = this.find(DEFAULT_LOCALE_CODE, keyPath)
      }
      if (info == null) {
        // still couldn't find it--return a clue of the problem
        return `[no content for "${col.keyPathAsString(
          this.fullKey(this.currentLocaleCode, keyPath)
        )}"]`
      }
    }

    let val: any = info.value

    if (templateSubstitutions !== undefined) {
      if (Array.isArray(val)) {
        return this.interpolateArray(val, templateSubstitutions)
      }
      if (typeof val === 'string') {
        return evaluateTemplate(val as string, templateSubstitutions)
      }
    }

    return val
  }

  interpolateArray(templateArray: string[], params: object): string[] {
    return templateArray.map((item) => evaluateTemplate(item, params))
  }

  /*
   * Gets value, but if the value is not found, return 'undefined'. I.e. don't roll over to default
   * dictionary, or produce informative default value.
   */
  getExact(keyPath: KeyPath): any {
    if (keyPath == null) throw new Error("'keyPath' is null/undefined")

    let info = this.find(this.currentLocaleCode, keyPath)

    if (info == null) {
      return undefined // could not find value
    }

    return info.value
  }

  /* Return a new Lexicon, with the "root" starting at a different place.
     E.g.
       a = Lexicon({greeting: "hi", secondLevel: {title: "Mister"}})
       a.subset('secondLevel') // --> Lexicon({title: "Mister"})
  */
  subset(keyPath: KeyPath): Lexicon | null {
    let rootPathExcludingLocale = this.fullKey(null, keyPath)
    return new Lexicon(
      this._data,
      this.currentLocaleCode,
      rootPathExcludingLocale
    )
  }

  inspect() {
    return `<${this.constructor.name} ${JSON.stringify(this, null, 2)}>`
  }

  // rootKey(lexicon) {
  rootKey(lexicon) {
    return lexicon.filename().replace('.', '_') // dots would be confused with key paths
  }

  /* Determine the complete "key path" to retrieve our value */
  private fullKey(locale: LocaleCode, keyPath: KeyPath) {
    const parts = [
      locale,
      col.keyPathAsString(this._subsetRoot),
      col.keyPathAsString(keyPath),
    ].filter(Boolean)
    return parts.join('.')
  }

  /* Find some content and return info about that node */
  private find(locale: LocaleCode, keyPath: KeyPath) {
    if (!isLocaleCode(locale))
      throw new Error(
        `'locale' should be LocaleCode, e.g. 'en', not: ${locale}`
      )
    if (keyPath == null) throw new Error("'keyPath' is null/undefined")

    return recursiveFind(this, col.keyPathAsArray(keyPath), this, [], [])

    function recursiveFind(
      node: Collection | Lexicon,
      keyPath: KeyPathArray,
      lexicon: Lexicon,
      rootPrefix: KeyPathArray,
      localPrefix: KeyPathArray
    ) {
      //       console.log('!!! recursiveFind() rootPrefix=', rootPrefix, 'localPrefix=', localPrefix, 'keyPath=', keyPath, 'node=', node)

      if (node === undefined) {
        return null // could not find the node
      }
      if (keyPath == null) throw new Error("'keyPath' is null/undefined")

      if (keyPath.length == 0 && !(node instanceof Lexicon)) {
        let result = {
          // Here's the output:
          lexicon: lexicon, // Which Lexicon contains this node?
          locale: locale, // The locale we were searching for
          keyPath: localPrefix, // The path from this Lexicon
          updatePath: rootPrefix, // argument for `rootLexicon.update()`
          value: node, // contents of the node we searched for
        }
        return result // Found it!
      }

      let nextNode = undefined

      if (node instanceof Lexicon) {
        lexicon = node
        localPrefix = []
        rootPrefix = rootPrefix.concat(['_data', locale])
        keyPath = [...col.keyPathAsArray(lexicon._subsetRoot), ...keyPath]
        nextNode = lodash_get(lexicon._data, locale)
      } else {
        const firstKey = keyPath[0]
        keyPath = keyPath.slice(1)
        rootPrefix = rootPrefix.concat([firstKey]) // use concat to not modify old value
        localPrefix = localPrefix.concat([firstKey])
        nextNode = lodash_get(node, firstKey)
      }

      return recursiveFind(nextNode, keyPath, lexicon, rootPrefix, localPrefix)
    }
  }

  //
  //    Methods for use by Lexicon Editor
  //

  /*
     Returns the filename and KeyPath of the item in question.
     The returned keyPath might be different from the input because you're looking
     at a Lexicon subset, with some keys hidden.
   */
  source(keyPath: KeyPath) {
    let info = this.find(this.currentLocaleCode, keyPath)
    if (info == null)
      throw new Error(
        `Lexicon: Could not find keyPath: '${keyPath}' in file: '${this.filename()}'`
      )
    return {
      localPath: [info.locale].concat(info.keyPath),
      updatePath: info.updatePath,
      lexicon: info.lexicon,
    }
  }

  /* Return language codes for available locales */
  locales(): Array<LocaleCode> {
    const result = Object.keys(this._data) as Array<LocaleCode>

    const index = result.indexOf('repoPath')
    if (index > -1) {
      // only splice array when item is found
      result.splice(index, 1) // 2nd parameter means remove one item only
    }

    return result
  }

  // filename and path of the JSON file that contains this data, e.g. 'path/to/content.json'
  filename(): string {
    return this._filename
  }

  /* Optional note from ContentByLocale, shown in the editor when present */
  editorNote(): string | undefined {
    return this._data?.editorNote
  }

  /* Lexicon for the given tab (filename basename). For a single Lexicon, returns this if it matches. */
  lexiconForTab(tabName: string): Lexicon | null {
    const basename = this._filename.split('/').pop() || this._filename
    return basename === tabName ? this : null
  }

  /* Return list of dotted keys, e.g. ['mycomponent.title', 'mycomponent.page1.intro'] */
  keys(): Array<KeyPathString> {
    const info = this.find(this.currentLocaleCode, [])
    if (info == null) return []

    const startingNode = info.value

    let flatKeys: KeyPathArray = []
    recurse(startingNode, '')
    return flatKeys

    function recurse(c: Collection | Lexicon, prefix: string) {
      for (const [key, node] of Object.entries(c)) {
        if (node instanceof Lexicon) {
          const subKeys = node.keys()
          const prefixedKeys = subKeys.map(
            (keyPath) => `${prefix}${key}.${keyPath}`
          )
          flatKeys = flatKeys.concat(prefixedKeys)
        } else if (col.isCollection(node)) {
          recurse(node, `${prefix}${key}.`)
        } else {
          flatKeys.push(`${prefix}${key}`)
        }
      }
    }
  }

  /* return [array of [key, value]] pairs in the current locale */
  entries(): Array<[KeyPathString, any]> {
    return this.keys().map((key) => [key, this.get(key)])
  }

  /* Returns new instance, with a value changed.
   * Note that updatePath is interepreted from the root of this Lexicon, and ignores current
   * locale and subset settings
   */
  private static setInLexicon(
    obj: any,
    path: string[],
    value: any
  ): Lexicon | any {
    if (path.length === 0) return value
    const [first, ...rest] = path
    const current = obj?.[first]
    if (current instanceof Lexicon) {
      const newLexicon = Lexicon.setInLexicon(current, rest, value)
      const cloned = Array.isArray(obj) ? [...obj] : { ...obj }
      cloned[first] = newLexicon
      return cloned
    }
    if (obj instanceof Lexicon) {
      const newData = Lexicon.setInLexicon(obj._data, rest, value)
      return new (classConstructor(obj))(
        newData,
        obj.currentLocaleCode,
        obj._subsetRoot
      )
    }
    const cloned = Array.isArray(obj) ? [...obj] : { ...obj }
    const isArrayIndex = rest.length > 0 && /^\d+$/.test(String(rest[0]))
    cloned[first] =
      rest.length === 0
        ? value
        : Lexicon.setInLexicon(current ?? (isArrayIndex ? [] : {}), rest, value)
    return cloned
  }

  set(updatePath: KeyPath, newValue: any): Lexicon {
    if (!hasAtPath(this, updatePath))
      throw new Error(`node ${updatePath} does not exist`)

    return Lexicon.setInLexicon(
      this,
      col.keyPathAsArray(updatePath),
      newValue
    ) as Lexicon
  }
}
