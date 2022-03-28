import { roundToDecimalPlaces } from './numbers'

describe('roundToDecimalPlaces', () => {
  it('leaves an integer as-is', () => {
    expect(roundToDecimalPlaces(1, 1)).toEqual(1)
  })

  it('leaves the number untouched if it already has the correct number of decimal places', () => {
    expect(roundToDecimalPlaces(25.3, 1)).toEqual(25.3)
  })

  it('rounds a number to the correct number of decimal places', () => {
    expect(roundToDecimalPlaces(3.34934853095, 1)).toEqual(3.3)
  })

  it('rounds a negative number to the correct number of decimal places', () => {
    expect(roundToDecimalPlaces(-155.34534, 2)).toEqual(-155.35)
  })
})
