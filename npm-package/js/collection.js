"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
function keyPathAsArray(keyPath) {
    if (lodash_1.isString(keyPath)) {
        keyPath = lodash_1.compact(keyPath.split('.'));
    }
    return keyPath;
}
exports.keyPathAsArray = keyPathAsArray;
/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
function keyPathAsString(keyPath) {
    if (lodash_1.isArray(keyPath)) {
        keyPath = keyPath.join('.');
    }
    return keyPath;
}
exports.keyPathAsString = keyPathAsString;
function isCollection(maybeCollection) {
    return lodash_1.isMap(maybeCollection)
        || lodash_1.isArray(maybeCollection)
        || lodash_1.isObject(maybeCollection);
}
exports.isCollection = isCollection;
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if (lodash_1.isNil(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if (lodash_1.isNil(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    keyPath = keyPathAsArray(keyPath);
    const [firstKey, ...rest] = keyPath;
    const subData = lodash_1.isMap(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
exports.get = get;
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if (lodash_1.isMap(c))
        return [...c.keys()];
    return lodash_1.keys(c);
}
exports.keys = keys;
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if (lodash_1.isMap(c))
        return [...c.entries()];
    return lodash_1.entries(c);
}
exports.entries = entries;
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if (lodash_1.isMap(c)) {
        if (keyPathAsArray(key).length > 1)
            throw new Error('Not implemented yet.');
        return c.has(keyPathAsString(key));
    }
    return lodash_1.has(c, key);
}
exports.has = has;
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if (lodash_1.isMap(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        lodash_1.set(c, key, value);
    }
    return c;
}
exports.set = set;
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if (lodash_1.isMap(c))
        return c.size;
    return lodash_1.size(c);
}
exports.size = size;
// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }
