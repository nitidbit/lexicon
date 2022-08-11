import isObject from 'lodash.isobject';
import lodash_size from 'lodash.size';
import lodash_set from 'lodash.set';
import isMap from 'lodash.ismap';
import isNil from 'lodash.isnil';
import lodash_has from 'lodash.has';
import isString from 'lodash.isstring';
import lodash_compact from 'lodash.compact';

/*
 * Functions that can manipulate 'Collections' irrespective of the actual storage type.
 * Similar to `lodash.get(myObject, 'key1.key2')` but also supports the Map class.
 * A Collection is an array, object, or Map.
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
  if (Array.isArray(keyPath)) {
    keyPath = keyPath.join('.');
  }
  return keyPath
}

export function isCollection(maybeCollection: any): boolean {
  return isMap(maybeCollection)
    || Array.isArray(maybeCollection)
    || isObject(maybeCollection)
}

// Like lodash.get(data, 'my.keys.0') but works with Maps too.
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


// Equivalent to lodash.keys(), but works with Maps
export function keys(c: Collection): Array<string> {
  if (isMap(c)) return [...c.keys()];
  return Object.keys(c);
}

// Equivalent to lodash.entries(), but works with Maps
export function entries(c: Collection): Array<[any, any]> {
  if (isMap(c)) return [...c.entries()];
  return Object.entries(c);
}

// Equivalent to lodash.has(), but works with Maps
export function has(c: Collection, key: KeyPath): boolean {
  if (isMap(c)) {
    if (keyPathAsArray(key).length > 1) throw new Error('Not implemented yet.');
    return c.has(keyPathAsString(key));
  }
  return lodash_has(c, key);
}

// Equivalent to lodash.set(), but works with Maps
export function set(c: Collection, key:KeyPath, value:any): Collection {
  if (isMap(c)) {
    throw new Error('set with keyPath not implemented yet');
//     c.set(key, value);
  } else {
    lodash_set(c, key, value);
  }
  return c;
}

// Equivalent to lodash.size(), but works with Maps
export function size(c: Collection): Number {
  if (isMap(c)) return c.size;
  return lodash_size(c);
}

// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (Array.isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }

