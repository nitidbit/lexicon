"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyPathAsArray = keyPathAsArray;
exports.keyPathAsString = keyPathAsString;
exports.isCollection = isCollection;
exports.get = get;
exports.keys = keys;
exports.entries = entries;
exports.has = has;
exports.set = set;
exports.size = size;
const lodash_es_1 = require("lodash-es");
/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
function keyPathAsArray(keyPath) {
    if ((0, lodash_es_1.isString)(keyPath)) {
        keyPath = (0, lodash_es_1.compact)(keyPath.split('.'));
    }
    return keyPath;
}
/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
function keyPathAsString(keyPath) {
    if ((0, lodash_es_1.isArray)(keyPath)) {
        keyPath = keyPath.join('.');
    }
    return keyPath;
}
function isCollection(maybeCollection) {
    return (0, lodash_es_1.isMap)(maybeCollection)
        || (0, lodash_es_1.isArray)(maybeCollection)
        || (0, lodash_es_1.isObject)(maybeCollection);
}
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if ((0, lodash_es_1.isNil)(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if ((0, lodash_es_1.isNil)(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    keyPath = keyPathAsArray(keyPath);
    const [firstKey, ...rest] = keyPath;
    const subData = (0, lodash_es_1.isMap)(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if ((0, lodash_es_1.isMap)(c))
        return [...c.keys()];
    return (0, lodash_es_1.keys)(c);
}
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if ((0, lodash_es_1.isMap)(c))
        return [...c.entries()];
    return (0, lodash_es_1.entries)(c);
}
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if ((0, lodash_es_1.isMap)(c)) {
        if (keyPathAsArray(key).length > 1)
            throw new Error('Not implemented yet.');
        return c.has(keyPathAsString(key));
    }
    return (0, lodash_es_1.has)(c, key);
}
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if ((0, lodash_es_1.isMap)(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        (0, lodash_es_1.set)(c, key, value);
    }
    return c;
}
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if ((0, lodash_es_1.isMap)(c))
        return c.size;
    return (0, lodash_es_1.size)(c);
}
// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }
