import { isLexiconExcluded } from './LexiconEditor'

describe('isLexiconExcluded', () => {
  it('returns false when excludeList is undefined', () => {
    expect(isLexiconExcluded('path/to/B.json', undefined)).toBe(false)
  })

  it('returns false when excludeList is empty', () => {
    expect(isLexiconExcluded('path/to/B.json', [])).toBe(false)
  })

  it('returns true for exact match', () => {
    expect(isLexiconExcluded('path/to/B.json', ['path/to/B.json'])).toBe(true)
  })

  it('returns true for basename match', () => {
    expect(isLexiconExcluded('path/to/B.json', ['B.json'])).toBe(true)
  })

  it('returns true for basename match when filename has no path', () => {
    expect(isLexiconExcluded('B.json', ['B.json'])).toBe(true)
  })

  it('returns false when no pattern matches', () => {
    expect(isLexiconExcluded('path/to/A.json', ['B.json'])).toBe(false)
    expect(isLexiconExcluded('A.json', ['path/to/B.json'])).toBe(false)
  })

  it('returns true when any pattern matches', () => {
    expect(isLexiconExcluded('path/to/B.json', ['A.json', 'B.json'])).toBe(true)
  })
})
