import { validateAddressManual } from './validateAddressManual'

describe('validateAddressManual', () => {
  const requestBody = {
    line1: '345 PORCHESTER ROAD ',
    line2: ' SOUTHSEA',
    town: 'PORTSMOUTH ',
    postcode: 'PO14OY',
  }
  const urlInfo = { basePath: '/recalls/', currentPage: 'address-manual' }

  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const { errors, valuesToSave } = validateAddressManual({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      line1: '345 PORCHESTER ROAD',
      line2: 'SOUTHSEA',
      town: 'PORTSMOUTH',
      postcode: 'PO1 4OY',
      source: 'MANUAL',
    })
  })

  it('returns valuesToSave and no errors if address line 2 is omitted', () => {
    const { errors, valuesToSave } = validateAddressManual({ requestBody: { ...requestBody, line2: '' }, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      line1: '345 PORCHESTER ROAD',
      line2: '',
      town: 'PORTSMOUTH',
      postcode: 'PO1 4OY',
      source: 'MANUAL',
    })
  })

  it('returns valuesToSave and no errors if postcode is omitted', () => {
    const { errors, valuesToSave } = validateAddressManual({ requestBody: { ...requestBody, postcode: '' }, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      line1: '345 PORCHESTER ROAD',
      line2: 'SOUTHSEA',
      town: 'PORTSMOUTH',
      postcode: '',
      source: 'MANUAL',
    })
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateAddressManual({ requestBody: emptyBody, urlInfo })
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
    const { errors, valuesToSave } = validateAddressManual({ requestBody: body, urlInfo })
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
    const { errors, unsavedValues } = validateAddressManual({ requestBody: { ...requestBody, town: '' }, urlInfo })
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
    const { errors, valuesToSave } = validateAddressManual({
      requestBody: {
        ...requestBody,
        postcode: 'A123 45',
      },
      urlInfo,
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
