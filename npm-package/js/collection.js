"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.size = exports.set = exports.has = exports.entries = exports.keys = exports.get = exports.isCollection = exports.keyPathAsString = exports.keyPathAsArray = void 0;
const lodash_isobject_1 = __importDefault(require("lodash.isobject"));
const lodash_size_1 = __importDefault(require("lodash.size"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const lodash_ismap_1 = __importDefault(require("lodash.ismap"));
const lodash_isnil_1 = __importDefault(require("lodash.isnil"));
const lodash_has_1 = __importDefault(require("lodash.has"));
const lodash_isstring_1 = __importDefault(require("lodash.isstring"));
const lodash_compact_1 = __importDefault(require("lodash.compact"));
/* return in Array form, e.g. 'my.key.path' -> ['my', 'key', 'path'] */
function keyPathAsArray(keyPath) {
    if (lodash_isstring_1.default(keyPath)) {
        keyPath = lodash_compact_1.default(keyPath.split('.'));
    }
    return keyPath;
}
exports.keyPathAsArray = keyPathAsArray;
/* return in dotted-string form, e.g. ['my', 'key', 'path'] -> 'my.key.path' */
function keyPathAsString(keyPath) {
    if (Array.isArray(keyPath)) {
        keyPath = keyPath.join('.');
    }
    return keyPath;
}
exports.keyPathAsString = keyPathAsString;
function isCollection(maybeCollection) {
    return lodash_ismap_1.default(maybeCollection)
        || Array.isArray(maybeCollection)
        || lodash_isobject_1.default(maybeCollection);
}
exports.isCollection = isCollection;
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if (lodash_isnil_1.default(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if (lodash_isnil_1.default(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    keyPath = keyPathAsArray(keyPath);
    const [firstKey, ...rest] = keyPath;
    const subData = lodash_ismap_1.default(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
exports.get = get;
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if (lodash_ismap_1.default(c))
        return [...c.keys()];
    return Object.keys(c);
}
exports.keys = keys;
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if (lodash_ismap_1.default(c))
        return [...c.entries()];
    return Object.entries(c);
}
exports.entries = entries;
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if (lodash_ismap_1.default(c)) {
        if (keyPathAsArray(key).length > 1)
            throw new Error('Not implemented yet.');
        return c.has(keyPathAsString(key));
    }
    return lodash_has_1.default(c, key);
}
exports.has = has;
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if (lodash_ismap_1.default(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        lodash_set_1.default(c, key, value);
    }
    return c;
}
exports.set = set;
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if (lodash_ismap_1.default(c))
        return c.size;
    return lodash_size_1.default(c);
}
exports.size = size;
// Returns an iterator for the collection
// export function iterator(c: Collection): Iterator<any> {
//   if (isObject(c)) return lodash_entries(c)[Symbol.iterator]();
//   if (Array.isArray(c)) return (c as Array<any>)[Symbol.iterator]();
//   else return (c as Map<any, any>)[Symbol.iterator]();
// }
