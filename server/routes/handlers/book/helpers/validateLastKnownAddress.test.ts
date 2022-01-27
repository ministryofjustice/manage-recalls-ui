import { validateLastKnownAddress } from './validateLastKnownAddress'

describe('validateLastKnownAddress', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'last-known-address' }

  it('returns a value to save and no errors if No fixed abode is submitted', () => {
    const requestBody = {
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    }
    const { errors, valuesToSave } = validateLastKnownAddress({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    })
  })

  it('returns a value to save and no errors, if Yes is submitted', () => {
    const requestBody = {
      lastKnownAddressOption: 'YES',
    }
    const { errors, valuesToSave } = validateLastKnownAddress({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      lastKnownAddressOption: 'YES',
    })
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      lastKnownAddressOption: '',
    }
    const { errors, valuesToSave } = validateLastKnownAddress({ requestBody, urlInfo })
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
    const { redirectToPage } = validateLastKnownAddress({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/postcode-lookup')
  })

  it('sets redirectToPage to request received, if answer is No, and no fromPage supplied', () => {
    const requestBody = {
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    }
    const { redirectToPage } = validateLastKnownAddress({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/request-received')
  })

  it('sets redirectToPage to fromPage if supplied and answer is No', () => {
    const requestBody = {
      lastKnownAddressOption: 'NO_FIXED_ABODE',
    }
    const { redirectToPage } = validateLastKnownAddress({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })
})
