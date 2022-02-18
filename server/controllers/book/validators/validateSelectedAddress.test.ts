import { validateSelectedAddress } from './validateSelectedAddress'

describe('validateSelectedAddress', () => {
  it('returns valuesToSave and no errors if address is submitted', () => {
    const addressUprn = '357'
    const { errors, valuesToSave } = validateSelectedAddress(addressUprn)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      addressUprn: '357',
    })
  })

  it('returns errors for missing address, and no valuesToSave', () => {
    const addressUprn = ''
    const { errors, valuesToSave } = validateSelectedAddress(addressUprn)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#addressUprn',
        name: 'addressUprn',
        text: 'Select an address',
      },
    ])
  })
})
