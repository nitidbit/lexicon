"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const lodash_1 = __importDefault(require("lodash"));
class LexiconShape {
    constructor(name, shape, filename) {
        this._LexiconShapeName = name;
        this._isLeafItem = (shape === 'LeafItem');
        this._filename = filename;
        if (lodash_1.default.isArray(shape)) {
            this._arrayShape = shape;
        }
        else if (lodash_1.default.isObject(shape)) {
            lodash_1.default.assign(this, shape);
        }
    }
    toString() { return `<LexiconShape ${this._LexiconShapeName} (${JSON.stringify(this)})>`; }
    inspect() { return this.toString(); }
    name() { return this._LexiconShapeName; }
    // Returns an Object similar to `textContent` but containing only those fields defined by
    // `LexiconShape`. If fields are missing, an exception is raised.
    extract(textContent) {
        return extract(this, textContent);
    }
    flatShape(shape, prefix = '') {
        if (shape === undefined) {
            throw new Error('Cannot flatten an undefined shape!');
        }
        if (prefix.length > 200) {
            console.error('long prefix');
        }
        let keysAndSubShapes = keyShapePairs(shape);
        let valuesInArray = lodash_1.default.map(keysAndSubShapes, ([key, subShape]) => {
            let prefixedKey = `${prefix}${key}`;
            if (!isLeafItem(subShape)) {
                return this.flatShape(subShape, `${prefixedKey}.`);
            }
            else {
                return [[prefixedKey, subShape]];
            }
        });
        let result = lodash_1.default.flatten(valuesInArray);
        return result;
    }
    fileAndKeyFor(ikey, root = this) {
        const separator = ikey.indexOf('.'), first = ikey.substr(0, separator), rest = ikey.substr(separator + 1);
        const elem = root[first];
        if (elem instanceof LexiconShape && elem._filename !== undefined) {
            return elem.fileAndKeyFor(rest);
        }
        else if (lodash_1.default.isObject(elem)) {
            const [file, key] = this.fileAndKeyFor(rest, elem);
            return [file, `${first}.${key}`];
        }
        else {
            return [this._filename, ikey];
        }
    }
}
exports.LexiconShape = LexiconShape;
// const isLexiconShape = (maybeLexiconShape) => maybeLexiconShape.hasOwnProperty('_LexiconShapeName');
exports.ShortString = new LexiconShape('ShortString', 'LeafItem');
exports.LongString = new LexiconShape('LongString', 'LeafItem');
//
// Internal functions
//
function extract(shape, content) {
    let result;
    //     console.log('\n### ---\n\n extract: LexiconShape=',this,
    //       'isLeaf=', isLeafItem(this),
    //       'isArray=', _.isArray(this),
    //       'shape._arrayShape=', shape._arrayShape,
    //       'isObject=', _.isObject(this), '\n\n');
    if (isLeafItem(shape))
        result = extractLeafItem(shape, content);
    else if (lodash_1.default.isArray(shape))
        result = extractArray(shape, content);
    else if (shape._arrayShape)
        result = extractArray(shape._arrayShape, content);
    else
        result = extractObject(shape, content);
    return result;
}
function extractObject(shape, content) {
    let keysAndSubShapes = keyShapePairs(shape);
    let keysAndContent = lodash_1.default.map(keysAndSubShapes, ([key, subShape]) => {
        if (!lodash_1.default.has(content, key)) {
            throw new Error(`LexiconError -- key "${key}" is not in: ${shape instanceof LexiconShape ? shape.name() : JSON.stringify(lodash_1.default.keys(content))}`);
        }
        let subContent = extract(subShape, content[key]);
        return [key, subContent];
    });
    let result = fp_1.default.fromPairs(keysAndContent);
    return result;
}
function extractArray(shape, content) {
    let subShape = shape[0];
    return lodash_1.default.map(content, (entry) => extract(subShape, entry));
}
function extractLeafItem(shape, content) {
    return content;
}
const isLeafItem = (shape) => (shape instanceof LexiconShape) && (shape._isLeafItem);
const keyShapePairs = (shape) => {
    let keysAndSubShapes = lodash_1.default.toPairs(shape);
    keysAndSubShapes = _filterKeysInShape(shape, keysAndSubShapes);
    return keysAndSubShapes;
};
const _filterKeysInShape = (shape, keysAndShapes) => {
    let allowed = allowedKeys(shape);
    return lodash_1.default.filter(keysAndShapes, ([key, objOrLexiconShape]) => fp_1.default.contains(key, allowed));
};
const allowedKeys = (shape) => {
    let allKeys = lodash_1.default.keys(shape);
    let keysExcludingUnderscore = lodash_1.default.filter(allKeys, key => !key.match(/^_/));
    return keysExcludingUnderscore;
};
