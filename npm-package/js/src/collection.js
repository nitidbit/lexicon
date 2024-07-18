"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
    if ((0, isString_1.default)(keyPath)) {
        keyPath = (0, compact_1.default)(keyPath.split('.'));
    }
    return keyPath;
}
/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
function keyPathAsString(keyPath) {
    if ((0, isArray_1.default)(keyPath)) {
        keyPath = keyPath.join('.');
    }
    return keyPath;
}
function isCollection(maybeCollection) {
    return (0, isMap_1.default)(maybeCollection)
        || (0, isArray_1.default)(maybeCollection)
        || (0, isObject_1.default)(maybeCollection);
}
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if ((0, isNil_1.default)(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if ((0, isNil_1.default)(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    keyPath = keyPathAsArray(keyPath);
    const [firstKey, ...rest] = keyPath;
    const subData = (0, isMap_1.default)(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if ((0, isMap_1.default)(c))
        return [...c.keys()];
    return (0, keys_1.default)(c);
}
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if ((0, isMap_1.default)(c))
        return [...c.entries()];
    return (0, entries_1.default)(c);
}
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if ((0, isMap_1.default)(c)) {
        if (keyPathAsArray(key).length > 1)
            throw new Error('Not implemented yet.');
        return c.has(keyPathAsString(key));
    }
    return (0, has_1.default)(c, key);
}
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if ((0, isMap_1.default)(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        (0, set_1.default)(c, key, value);
    }
    return c;
}
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if ((0, isMap_1.default)(c))
        return c.size;
    return (0, size_1.default)(c);
}
// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }
