"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isString_1 = __importDefault(require("lodash/isString"));
const isMap_1 = __importDefault(require("lodash/isMap"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const isObject_1 = __importDefault(require("lodash/isObject"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const size_1 = __importDefault(require("lodash/size"));
const set_1 = __importDefault(require("lodash/set"));
const has_1 = __importDefault(require("lodash/has"));
const entries_1 = __importDefault(require("lodash/entries"));
const keys_1 = __importDefault(require("lodash/keys"));
const compact_1 = __importDefault(require("lodash/compact"));
/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
function keyPathAsArray(keyPath) {
    if (isString_1.default(keyPath)) {
        keyPath = compact_1.default(keyPath.split('.'));
    }
    return keyPath;
}
exports.keyPathAsArray = keyPathAsArray;
/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
function keyPathAsString(keyPath) {
    if (isArray_1.default(keyPath)) {
        keyPath = keyPath.join('.');
    }
    return keyPath;
}
exports.keyPathAsString = keyPathAsString;
function isCollection(maybeCollection) {
    return isMap_1.default(maybeCollection)
        || isArray_1.default(maybeCollection)
        || isObject_1.default(maybeCollection);
}
exports.isCollection = isCollection;
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if (isNil_1.default(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if (isNil_1.default(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    keyPath = keyPathAsArray(keyPath);
    const [firstKey, ...rest] = keyPath;
    const subData = isMap_1.default(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
exports.get = get;
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if (isMap_1.default(c))
        return [...c.keys()];
    return keys_1.default(c);
}
exports.keys = keys;
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if (isMap_1.default(c))
        return [...c.entries()];
    return entries_1.default(c);
}
exports.entries = entries;
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if (isMap_1.default(c)) {
        if (keyPathAsArray(key).length > 1)
            throw new Error('Not implemented yet.');
        return c.has(keyPathAsString(key));
    }
    return has_1.default(c, key);
}
exports.has = has;
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if (isMap_1.default(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        set_1.default(c, key, value);
    }
    return c;
}
exports.set = set;
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if (isMap_1.default(c))
        return c.size;
    return size_1.default(c);
}
exports.size = size;
// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }
