import _ from 'lodash';

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
  if (_.isString(keyPath)) {
    keyPath = _.compact(keyPath.split('.'));
  }
  return keyPath
}

/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
export function keyPathAsString(keyPath: KeyPath): string {
  if (_.isArray(keyPath)) {
    keyPath = keyPath.join('.');
  }
  return keyPath
}

export function isCollection(maybeCollection: any): boolean {
  return _.isMap(maybeCollection)
    || _.isArray(maybeCollection)
    || _.isObject(maybeCollection)
}

// Like lodash.get(data, 'my.keys.0') but works with Maps too.
export function get(data: Collection, keyPath: KeyPath): any {
  if (_.isNil(keyPath)) throw new Error("'keyPath' is null/undefined")
  if (_.isNil(data)) throw new Error("'data' is null/undefined")

  if (!isCollection(data)) {
    return undefined; // content not found
  }

  keyPath = keyPathAsArray(keyPath);
  const [firstKey, ...rest] = keyPath;
  const subData = _.isMap(data) ? data.get(firstKey) : data[firstKey];

  if (rest.length == 0) {
    return subData; // we found it
  }

  return get(subData, rest);
}


// Equivalent to lodash.keys(), but works with Maps
export function keys(c: Collection): Array<string> {
  if (_.isMap(c)) return [...c.keys()];
  return _.keys(c);
}

// Equivalent to lodash.entries(), but works with Maps
export function entries(c: Collection): Array<[any, any]> {
  if (_.isMap(c)) return [...c.entries()];
  return _.entries(c);
}

// Equivalent to lodash.has(), but works with Maps
export function has(c: Collection, key: string): boolean {
  if (_.isMap(c)) return c.has(key);
  return _.has(c, key);
}

// Equivalent to lodash.set(), but works with Maps
export function set(c: Collection, key:KeyPath, value:any): Collection {
  if (_.isMap(c)) {
    throw new Error('set with keyPath not implemented yet');
//     c.set(key, value);
  } else {
    _.set(c, key, value);
  }
  return c;
}

// Equivalent to lodash.size(), but works with Maps
export function size(c: Collection): Number {
  if (_.isMap(c)) return c.size;
  return _.size(c);
}

