import fp from 'lodash/fp';
import _ from 'lodash';

// Lexicon = Actual text or other data that we will show to user, e.g.
//    {
//      mypage: {
//        title: "blah",
//        body: "more stuff here",
//      }
//    }
export type Lexicon = any;

type LexiconSubShape = {
  [key: string]: string,
};

// LexiconShape = Description of the shape of Lexicon, e.g.
//    {
//      mypage: {
//        title: Text.ShortString,
//        body: Text.LongString,
//      }
//    }
type LexiconShapeType = {
  _LexiconShapeName: string,
  _isLeafItem: boolean,
  _arrayShape: any,
  _filename?: string,
  // constructor(name: string, shape: object|'LeafItem', filename?: string): void,
  // toString(): string,
  // inspect(): string,
  // name(): string,
  // extract(textContent: Lexicon): any,
  // flatShape(shape: LexiconShape, prefix: string): FlatShape,
  // fileAndKeyFor(ikey: DottedKey, root: LexiconShape|LexiconSubShape): [string|undefined, DottedKey],
} & { [key: string]: string|LexiconSubShape };

export class LexiconShape {
  _LexiconShapeName: string;
  _isLeafItem: boolean;
  _arrayShape: any;
  _filename?: string;

  constructor(name: string, shape: object|'LeafItem', filename?: string) {
    this._LexiconShapeName = name;
    this._isLeafItem = (shape === 'LeafItem');
    this._filename = filename;

    if (_.isArray(shape)) {
      this._arrayShape = shape;
    } else if (_.isObject(shape)) {
      _.assign(this, shape);
    }
  }

  toString() { return `<LexiconShape ${this._LexiconShapeName} (${JSON.stringify(this)})>`; }
  inspect() { return this.toString(); }

  name() { return this._LexiconShapeName; }


  // Returns an Object similar to `textContent` but containing only those fields defined by
  // `LexiconShape`. If fields are missing, an exception is raised.
  extract(textContent: Lexicon):any {
    return extract(this, textContent);
  }

  flatShape(shape:LexiconShape, prefix:string=''):FlatShape {
    if (shape === undefined) {
      throw new Error('Cannot flatten an undefined shape!');
    }

    if (prefix.length > 200) {
      console.error('long prefix');
    }

    let keysAndSubShapes = keyShapePairs(shape);
    let valuesInArray = _.map(keysAndSubShapes, ([key, subShape]) => {
      let prefixedKey = `${prefix}${key}`
      if (! isLeafItem(subShape)) {
        return this.flatShape(subShape, `${prefixedKey}.`);
      } else {
        return [[prefixedKey, subShape]];
      }
    });
    let result = _.flatten(valuesInArray);

    return result as FlatShape;
  }

  fileAndKeyFor(ikey:DottedKey, root:LexiconShape|LexiconSubShape=this): [string|undefined, DottedKey] {
    const separator = ikey.indexOf('.'),
      first = ikey.substr(0, separator),
      rest = ikey.substr(separator + 1);

    const elem = (root as { [key: string]: LexiconShape|LexiconSubShape|string})[first];
    if (elem instanceof LexiconShape && elem._filename !== undefined) {
      return elem.fileAndKeyFor(rest);
    } else if (_.isObject(elem)) {
      const [file, key] = this.fileAndKeyFor(rest, elem as LexiconSubShape);
      return [file, `${first}.${key}`];
    } else {
      return [this._filename, ikey];
    }
  }
}

// const isLexiconShape = (maybeLexiconShape) => maybeLexiconShape.hasOwnProperty('_LexiconShapeName');


export const ShortString = new LexiconShape('ShortString', 'LeafItem');
export const LongString = new LexiconShape('LongString', 'LeafItem');


// FlatShape = Same information as LexiconShape, but flattened out with dotted keys, e.g.
//   [
//     ['mypage.title', Text.ShortString],
//     ['mypage.body', Text.LongString],
//   ]
export type FlatShape = Array<[DottedKey, LexiconShape]>;


// The dotted key paths, e.g. 'mypage.title'
export type DottedKey = string;


//
// Internal functions
//

function extract(shape:LexiconShape|object|any[], content:Lexicon):any {
    let result;

//     console.log('\n### ---\n\n extract: LexiconShape=',this,
//       'isLeaf=', isLeafItem(this),
//       'isArray=', _.isArray(this),
//       'shape._arrayShape=', shape._arrayShape,
//       'isObject=', _.isObject(this), '\n\n');

    if (isLeafItem(shape)) result = extractLeafItem(shape as LexiconShape, content);
    else if (_.isArray(shape)) result = extractArray(shape as any[], content);
    else if ((shape as LexiconShape)._arrayShape) result = extractArray((shape as LexiconShape)._arrayShape, content);
    else result = extractObject(shape, content);
    return result;
}

function extractObject(shape:LexiconShape|object, content:Lexicon):object {
  let keysAndSubShapes = keyShapePairs(shape);
  let keysAndContent = _.map(keysAndSubShapes, ([key, subShape]) => {

    if (! _.has(content, key)) {
      throw new Error(`LexiconError -- key "${key}" is not in: ${shape instanceof LexiconShape ? shape.name() : JSON.stringify(_.keys(content))}`);
    }

    let subContent = extract(subShape, content[key]);

    return [key, subContent];
  });

  let result = fp.fromPairs(keysAndContent);

  return result;
}

function extractArray(shape:any[], content:Lexicon):any[] {
  let subShape = shape[0];
  return _.map(content, (entry) => extract(subShape, entry));
}

function extractLeafItem(shape:LexiconShape, content:Lexicon):any {
  return content;
}

const isLeafItem = (shape:LexiconShape|object) => (shape instanceof LexiconShape) && (shape._isLeafItem);


const keyShapePairs = (shape:LexiconShape|object) => {
  let keysAndSubShapes = _.toPairs(shape);
  keysAndSubShapes = _filterKeysInShape(shape, keysAndSubShapes);

  return keysAndSubShapes;
}

const _filterKeysInShape = (shape:LexiconShape|object, keysAndShapes:[string, any][]) => {
  let allowed = allowedKeys(shape)
  return _.filter(keysAndShapes,
    ([key, objOrLexiconShape]) => fp.contains(key, allowed)
  );
}

const allowedKeys = (shape:LexiconShape|object) => {
  let allKeys = _.keys(shape)
  let keysExcludingUnderscore = _.filter(allKeys, key => ! key.match(/^_/) );
  return keysExcludingUnderscore;
}
