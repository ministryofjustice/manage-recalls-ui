import { validateLastKnownAddress } from './validateLastKnownAddress'

describe('validateLastKnownAddress', () => {
  it('returns a value to save and no errors if No fixed abode is submitted', () => {
    const requestBody = {
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    }
    const { errors, valuesToSave } = validateLastKnownAddress(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    })
  })

  it('returns a value to save and no errors, if Yes is submitted', () => {
    const requestBody = {
      lastKnownAddressOption: 'YES',
    }
    const { errors, valuesToSave } = validateLastKnownAddress(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      lastKnownAddressOption: 'YES',
    })
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      lastKnownAddressOption: '',
    }
    const { errors, valuesToSave } = validateLastKnownAddress(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#lastKnownAddressOption',
        name: 'lastKnownAddressOption',
        text: 'Does {{ recall.fullName }} have a last known address?',
      },
    ])
  })

  it('sets redirectToPage to find address, if answer is Yes', () => {
    const requestBody = {
      lastKnownAddressOption: 'YES',
    }
    const { redirectToPage } = validateLastKnownAddress(requestBody)
    expect(redirectToPage).toEqual('postcode-lookup')
  })
})
