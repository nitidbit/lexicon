import lodash_get from 'lodash/get'

//
//      Other functions
//

/** Returns true if the path exists in obj (each step is own property). */
export function hasAtPath(obj: any, path: string | string[]): boolean {
  const arr = Array.isArray(path) ? path : String(path).split('.')
  for (const key of arr) {
    if (obj == null || !Object.prototype.hasOwnProperty.call(obj, key))
      return false
    obj = obj[key]
  }
  return true
}

export const evaluateTemplate = (
  template: string,
  substitutions: object
): string => {
  let escaped = false
  const segments: string[] = []

  for (let i = 0; i < template.length; i++) {
    if (template[i] == '\\' && !escaped) {
      escaped = true
      continue
    } else if (escaped) {
      segments.push(template[i])
      escaped = false
      continue
    } else if (template[i] == '#' && template[i + 1] == '{') {
      i += 2
      const startPos = i
      let level = 1
      while (level > 0) {
        if (i >= template.length)
          throw new Error(
            `Unterminated bracket in Lexicon template \`${template}\``
          )
        if (template[i] == '{') level++
        else if (template[i] == '}') level--
        i++
      }

      const path = template.substring(startPos, i - 1),
        value = lodash_get(substitutions, path)

      segments.push(value)
      i--
      continue
    } else {
      segments.push(template[i])
    }
  }

  return segments.join('')
}

// Extract and return a query parameter from the current 'location'
// e.g. at http://example.com?myvar=999
//      getURLParameter('myvar')        // returns: '999'
//      getURLParameter('missing')      // returns: null
// from https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
export function getURLParameter(name) {
  return (
    decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
        location.search
      ) || [null, ''])[1].replace(/\+/g, '%20')
    ) || null
  )
}
