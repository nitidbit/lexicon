import * as col from "./collection"


describe('Collection', () => {

  describe('get()', () => {
    it('fetches value from a Map', () => {
      const m = new Map()
      m.set('a', 'A')
      expect(col.get(m, 'a')).toEqual('A')
    })

    it('fetches value from an Object', () => {
      const o = {a: 'A'}
      expect(col.get(o, 'a')).toEqual('A')
    })

    it('fetches value from an array', () => {
      const a = ['A', 'B', 'C']
      expect(col.get(a, '1')).toEqual('B')
    })

    it('fetches nested values using a dot-separated key', () => {
      const data = { foo: 'FOO', 'alpha': ['A', 'B', {c: 'C'}]}
      expect(col.get(data, 'alpha.2.c')).toEqual('C')
    })
  })

  describe('keys()', () => {
    it('returns list of keys from an Object', () => {
      const data = { a: 'A', b: 'B' }
      expect(col.keys(data)).toEqual(['a', 'b'])
    })

    it('returns list of indices from an Array', () => {
      const data = [ 3.14, 2.70 ]
      expect(col.keys(data)).toEqual(['0', '1'])
    })
    it('returns list of keys from a Map', () => {
      const data = new Map()
      data.set('a', 'A')
      data.set('b', 'B')
      expect(col.keys(data)).toEqual(['a', 'b'])
    })
  })

  // entries()
  // has()
  // set()
  // size()
})
