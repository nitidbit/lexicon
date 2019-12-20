"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function isCollection(maybeCollection) {
    return lodash_1.default.isMap(maybeCollection)
        || lodash_1.default.isArray(maybeCollection)
        || lodash_1.default.isObject(maybeCollection);
}
exports.isCollection = isCollection;
// Like lodash.get(data, 'my.keys.0') but works with Maps too.
function get(data, keyPath) {
    if (lodash_1.default.isNull(keyPath) || lodash_1.default.isUndefined(keyPath))
        throw new Error("'keyPath' is null/undefined");
    if (lodash_1.default.isNull(data) || lodash_1.default.isUndefined(data))
        throw new Error("'data' is null/undefined");
    if (!isCollection(data)) {
        return undefined; // content not found
    }
    if (lodash_1.default.isString(keyPath)) {
        keyPath = keyPath.split('.');
    }
    const [firstKey, ...rest] = keyPath;
    const subData = lodash_1.default.isMap(data) ? data.get(firstKey) : data[firstKey];
    if (rest.length == 0) {
        return subData; // we found it
    }
    return get(subData, rest);
}
exports.get = get;
// Equivalent to lodash.keys(), but works with Maps
function keys(c) {
    if (lodash_1.default.isMap(c))
        return [...c.keys()];
    return lodash_1.default.keys(c);
}
exports.keys = keys;
// Equivalent to lodash.entries(), but works with Maps
function entries(c) {
    if (lodash_1.default.isMap(c))
        return [...c.entries()];
    return lodash_1.default.entries(c);
}
exports.entries = entries;
// Equivalent to lodash.has(), but works with Maps
function has(c, key) {
    if (lodash_1.default.isMap(c))
        return c.has(key);
    return lodash_1.default.has(c, key);
}
exports.has = has;
// Equivalent to lodash.set(), but works with Maps
function set(c, key, value) {
    if (lodash_1.default.isMap(c)) {
        throw new Error('set with keyPath not implemented yet');
        //     c.set(key, value);
    }
    else {
        lodash_1.default.set(c, key, value);
    }
    return c;
}
exports.set = set;
// Equivalent to lodash.size(), but works with Maps
function size(c) {
    if (lodash_1.default.isMap(c))
        return c.size;
    return lodash_1.default.size(c);
}
exports.size = size;
//
//      Other functions
//
exports.evaluateTemplate = (template, substitutions) => {
    let escaped = false;
    let replaced = '';
    for (let i = 0; i < template.length; i++) {
        if (template[i] == '\\' && !escaped) {
            escaped = true;
            continue;
        }
        else if (escaped) {
            replaced += template[i];
            escaped = false;
            continue;
        }
        else if (template[i] == '#' && template[i + 1] == '{') {
            i += 2;
            const startPos = i;
            let level = 1;
            while (level > 0) {
                if (i >= template.length)
                    throw new Error(`Unterminated bracket in Lexicon template \`${template}\``);
                if (template[i] == '{')
                    level++;
                else if (template[i] == '}')
                    level--;
                i++;
            }
            const path = template.substring(startPos, i - 1), value = get(substitutions, path);
            replaced += value;
            i--;
            continue;
        }
        else {
            replaced += template[i];
        }
    }
    return replaced;
};
// Extract and return a query parameter from the current 'location'
// e.g. at http://example.com?myvar=999
//      getURLParameter('myvar')        // returns: '999'
//      getURLParameter('missing')      // returns: null
// from https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
exports.getURLParameter = getURLParameter;
