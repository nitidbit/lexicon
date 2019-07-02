import * as Lexicon from './Lexicon'

describe('Lexicon module', () => {
  const SampleShape:any = new Lexicon.LexiconShape('SampleShape', {
    shorty: Lexicon.ShortString,
    parent: {
      child: Lexicon.ShortString,
    }
  }, 'dir/sample.json');

  const textContent = {
    shorty: "SHORT STRING",
    parent: {
      child: "CHILD",
      orphan: "ORPHAN",
    },
    unusedKey: "UNUSED KEY",
  };

  describe('new LexiconShape', () => {
    test('returns Object with passed parameters', () => {
      expect(SampleShape.shorty).toEqual({ _LexiconShapeName: 'ShortString', _isLeafItem: true});
      expect(SampleShape.parent).toEqual({ child: Lexicon.ShortString });
    });
  });


  describe('extract()', () => {
    describe('with simple non-nested shapes', () => {
      let SimpleShape = new Lexicon.LexiconShape('SimpleShape', { short: Lexicon.ShortString, long: Lexicon.LongString });

      test('returns Object with only keys and values indicated in the shape', () => {
        let content = {short: 'SHORT CONTENT', long: 'LONG CONTENT', unused: 'UNUSED CONTENT'};

        expect(SimpleShape.extract(content)).toEqual({short: 'SHORT CONTENT', long: 'LONG CONTENT'});
      });

      test('missing values raise exception', () => {
        let subject = () => { SimpleShape.extract({}) }
        expect(subject).toThrow();
      });
    });

    describe('with nested shapes', () => {
      it('returns only the strings that have been declared in LexiconShape', () => {
        expect(SampleShape.extract(textContent)).toEqual({
          shorty: "SHORT STRING",
          parent: {
            child: "CHILD",
          },
        });
      });
    });

    test('object shape with array element', () => {
      let TestShape = new Lexicon.LexiconShape('TestShape', { collection: [Lexicon.ShortString] });
      let Content = { collection: ['aaa', 'bbb', 'ccc'], shouldExclude: 'blah' };
      expect(TestShape.extract(Content)).toEqual({ collection: ['aaa', 'bbb', 'ccc']});
    });

    describe('array shape', () => {
      it('returns array content', () => {
        let TestShape = new Lexicon.LexiconShape('TestShape', [Lexicon.ShortString]);
        let Content = ['aaa', 'bbb', 'ccc'];
        expect(TestShape.extract(Content)).toEqual(['aaa', 'bbb', 'ccc']);
      });
    });
  });


  describe('flatShape', () => {
    const NestedLexiconShape = new Lexicon.LexiconShape('NestedLexiconShape', {
      top: Lexicon.ShortString,
      container: {
        inside_a: Lexicon.LongString,
        inside_b: Lexicon.LongString,
      },
    });

    it('returns list of dotted.keys and text type', () => {
      expect(NestedLexiconShape.flatShape(NestedLexiconShape)).toEqual([
        ['top', Lexicon.ShortString],
        ['container.inside_a', Lexicon.LongString],
        ['container.inside_b', Lexicon.LongString],
      ]);
    });

    xtest('works for arrays', () => {
      let Shape = new Lexicon.LexiconShape('Shape', [Lexicon.ShortString]);
      expect(Shape.flatShape(Shape)).toEqual([
        ['0', Lexicon.ShortString],
      ]);
    });
  });

  describe('fileAndKeyFor()', () => {

    describe('when passing a single LexiconShape,', () => {

      test('returns the filename and dotted key', () => {
        expect(SampleShape.fileAndKeyFor('parent.child')).toEqual(['dir/sample.json', 'parent.child']);
      });

    });

    describe('when passing a nested LexiconShape spread across multiple files,', () => {
      const subShape = new Lexicon.LexiconShape('subShape', {
        subKey: Lexicon.ShortString,
      }, 'dir/subShape.json');
      const subShape2 = new Lexicon.LexiconShape('subShape2', {
        subKey2: Lexicon.ShortString,
      });
      const Shape = new Lexicon.LexiconShape('Shape', {
        key1: Lexicon.ShortString,
        subShape,
        subShape2,
        otherMessages: {
          key: Lexicon.ShortString,
        },
      }, 'dir/shape.json');

      test('returns the child shape\'s filename', () => {
        expect(Shape.fileAndKeyFor('subShape.subKey')).toEqual(['dir/subShape.json', 'subKey']);
      });

      test('children without their own filename inherit the parent\'s', () => {
        expect(Shape.fileAndKeyFor('subShape2.subKey2')).toEqual(['dir/shape.json', 'subShape2.subKey2']);
      });

      
    });
  });
});
