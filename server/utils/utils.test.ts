import convertToTitleCase, { getProperty } from './utils'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe('getProperty', () => {
  it('returns a nested property', () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'davey@crockett.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.email')
    expect(val).toEqual('davey@crockett.com')
  })

  it('returns a top level property', () => {
    const obj = {
      legalRepresentativeInfo: 'blah',
    }
    const val = getProperty(obj, 'legalRepresentativeInfo')
    expect(val).toEqual('blah')
  })

  it("returns undefined for a nested property thtaa doesn't exist", () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'davey@crockett.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.phone')
    expect(val).toBeUndefined()
  })
})
