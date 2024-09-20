import isString from 'lodash/isString';
import isMap from 'lodash/isMap';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import lodash_compact from 'lodash/compact';

/*
    Functions that can manipulate the '_data' part of a Lexicon, which is mix of:
      Objects, Arrays, and other Lexicons.

    Allows Lexicons to manipulate its data tree without worrying about what type each node is.
    E.g.:
      collection.set(Lexicon, 'en.blah', 'new blah')
 */


export type Collection = Map<any, any> | Array<any> | object;

// Specifies keys in a tree of collections, either as dotted strings 'key.2.anotherKey'
// or as an array ['key', 2, 'anotherKey']
export type KeyPathArray = Array<string>
export type KeyPathString = string
export type KeyPath = KeyPathArray | KeyPathString;

/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
export function keyPathAsArray(keyPath: KeyPath): Array<string> {
  if (isString(keyPath)) {
    keyPath = lodash_compact(keyPath.split('.'));
  }
  return keyPath
}

/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
export function keyPathAsString(keyPath: KeyPath): string {
  if (isArray(keyPath)) {
    keyPath = keyPath.join('.');
  }
  return keyPath
}

export function isCollection(maybeCollection: any): boolean {
  return isArray(maybeCollection)
    || isObject(maybeCollection)
}

// Like lodash.get(data, 'my.keys.0') but works with nested Lexicons too.
export function get(data: Collection, keyPath: KeyPath): any {
  if (isNil(keyPath)) throw new Error("'keyPath' is null/undefined")
  if (isNil(data)) throw new Error("'data' is null/undefined")

  if (!isCollection(data)) {
    return undefined; // content not found
  }

  keyPath = keyPathAsArray(keyPath);
  const [firstKey, ...rest] = keyPath;
  const subData = isMap(data) ? data.get(firstKey) : data[firstKey];

  if (rest.length == 0) {
    return subData; // we found it
  }

  return get(subData, rest);
}
