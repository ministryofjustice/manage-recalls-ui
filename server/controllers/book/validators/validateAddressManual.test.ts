import { validateAddressManual } from './validateAddressManual'

describe('validateAddressManual', () => {
  const recallId = '123'
  const requestBody = {
    line1: '345 PORCHESTER ROAD ',
    line2: ' SOUTHSEA',
    town: 'PORTSMOUTH ',
    postcode: 'PO14OY',
  }

  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const { errors, valuesToSave } = validateAddressManual(recallId, requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallId: '123',
      line1: '345 PORCHESTER ROAD',
      line2: 'SOUTHSEA',
      town: 'PORTSMOUTH',
      postcode: 'PO1 4OY',
      source: 'MANUAL',
    })
  })

  it('returns valuesToSave and no errors if address line 2 is omitted', () => {
    const { errors, valuesToSave } = validateAddressManual(recallId, { ...requestBody, line2: '' })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallId: '123',
      line1: '345 PORCHESTER ROAD',
      line2: '',
      town: 'PORTSMOUTH',
      postcode: 'PO1 4OY',
      source: 'MANUAL',
    })
  })

  it('returns valuesToSave and no errors if postcode is omitted', () => {
    const { errors, valuesToSave } = validateAddressManual(recallId, { ...requestBody, postcode: '' })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallId: '123',
      line1: '345 PORCHESTER ROAD',
      line2: 'SOUTHSEA',
      town: 'PORTSMOUTH',
      postcode: '',
      source: 'MANUAL',
    })
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateAddressManual(recallId, emptyBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#line1',
        name: 'line1',
        text: 'Enter an address line 1',
      },
      {
        href: '#town',
        name: 'town',
        text: 'Enter a town or city',
      },
    ])
  })

  it('returns errors for required fields with only whitespace', () => {
    const body = {
      line1: '   ',
      town: '  ',
    }
    const { errors, valuesToSave } = validateAddressManual(recallId, body)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#line1',
        name: 'line1',
        text: 'Enter an address line 1',
      },
      {
        href: '#town',
        name: 'town',
        text: 'Enter a town or city',
      },
    ])
  })

  it('returns unsavedValues when there are errors', () => {
    const { errors, unsavedValues } = validateAddressManual(recallId, { ...requestBody, town: '' })
    expect(unsavedValues).toEqual({
      line1: '345 PORCHESTER ROAD',
      line2: 'SOUTHSEA',
      postcode: 'PO1 4OY',
      town: '',
    })
    expect(errors).toEqual([
      {
        href: '#town',
        name: 'town',
        text: 'Enter a town or city',
      },
    ])
  })

  it('returns an error for invalid postcode, and no valuesToSave', () => {
    const { errors, valuesToSave } = validateAddressManual(recallId, {
      ...requestBody,
      postcode: 'A123 45',
    })
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
