import { validateFindAddress } from './validateFindAddress'

describe('validateFindAddress', () => {
  it('returns valuesToSave and no errors if postcode is submitted', () => {
    const postcode = 'PO14OY'
    const { errors, valuesToSave } = validateFindAddress(postcode)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      postcode: 'PO1 4OY',
    })
  })

  it('returns errors for missing postcode, and no valuesToSave', () => {
    const postcode = ''
    const { errors, valuesToSave } = validateFindAddress(postcode)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#postcode',
        name: 'postcode',
        text: 'Enter a postcode',
      },
    ])
  })

  it('returns an error for invalid postcode, and no valuesToSave', () => {
    const postcode = '123'
    const { errors, valuesToSave } = validateFindAddress(postcode)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#postcode',
        name: 'postcode',
        text: 'Enter a postcode in the correct format, like SW1H 9AJ',
      },
    ])
  })
})
