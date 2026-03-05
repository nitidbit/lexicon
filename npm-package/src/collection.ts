/*
    Functions that can manipulate the '_data' part of a Lexicon, which is mix of:
      Objects, Arrays, and other Lexicons.

    Allows Lexicons to manipulate its data tree without worrying about what type each node is.
    E.g.:
      collection.set(Lexicon, 'en.blah', 'new blah')
 */

export type Collection = Map<any, any> | Array<any> | object

// Specifies keys in a tree of collections, either as dotted strings 'key.2.anotherKey'
// or as an array ['key', 2, 'anotherKey']
export type KeyPathArray = Array<string>
export type KeyPathString = string
export type KeyPath = KeyPathArray | KeyPathString

/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
export function keyPathAsArray(keyPath: KeyPath): Array<string> {
  if (typeof keyPath === 'string') {
    keyPath = keyPath.split('.').filter(Boolean)
  }
  return keyPath
}

/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
export function keyPathAsString(keyPath: KeyPath): string {
  if (Array.isArray(keyPath)) {
    keyPath = keyPath.join('.')
  }
  return keyPath
}

export function isCollection(maybeCollection: any): boolean {
  return (
    Array.isArray(maybeCollection) ||
    (typeof maybeCollection === 'object' && maybeCollection !== null)
  )
}

// Like lodash.get(data, 'my.keys.0') but works with nested Lexicons too.
export function get(data: Collection, keyPath: KeyPath): any {
  if (keyPath == null) throw new Error("'keyPath' is null/undefined")
  if (data == null) throw new Error("'data' is null/undefined")

  if (!isCollection(data)) {
    return undefined // content not found
  }

  keyPath = keyPathAsArray(keyPath)
  const [firstKey, ...rest] = keyPath
  const subData = data instanceof Map ? data.get(firstKey) : data[firstKey]

  if (rest.length == 0) {
    return subData // we found it
  }

  return get(subData, rest)
}
