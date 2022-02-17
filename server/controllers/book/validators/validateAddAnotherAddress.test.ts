import { validateAddAnotherAddress } from './validateAddAnotherAddress'

describe('validateAddAnotherAddress', () => {
  it('returns a redirect URL to postcode-lookup and no errors if YES is submitted', () => {
    const urlInfo = {
      basePath: '/recalls/',
      currentPage: 'request-received',
      fromPage: 'view-recall',
      fromHash: 'custodyDetails',
    }
    const addAnotherAddressOption = 'YES'
    const { errors, redirectToPage } = validateAddAnotherAddress({ addAnotherAddressOption, urlInfo })
    expect(errors).toBeUndefined()
    expect(redirectToPage).toEqual('/recalls/postcode-lookup?fromPage=view-recall&fromHash=custodyDetails')
  })

  it('returns a redirect URL to request-received and no errors if NO is submitted and no fromPage supplied', () => {
    const urlInfo = { basePath: '/recalls/', currentPage: 'request-received' }
    const addAnotherAddressOption = 'NO'
    const { errors, redirectToPage } = validateAddAnotherAddress({ addAnotherAddressOption, urlInfo })
    expect(errors).toBeUndefined()
    expect(redirectToPage).toEqual('/recalls/request-received')
  })

  it('returns a redirect URL to fromPage and no errors if NO is submitted and a fromPage is supplied', () => {
    const urlInfo = {
      basePath: '/recalls/',
      currentPage: 'request-received',
      fromPage: 'check-answers',
      fromHash: 'custodyDetails',
    }
    const addAnotherAddressOption = 'NO'
    const { errors, redirectToPage } = validateAddAnotherAddress({ addAnotherAddressOption, urlInfo })
    expect(errors).toBeUndefined()
    expect(redirectToPage).toEqual('/recalls/check-answers#custodyDetails')
  })

  it('returns an error for the decision, if not set', () => {
    const addAnotherAddressOption = ''
    const urlInfo = { basePath: '/recalls/', currentPage: 'request-received' }
    const { errors, valuesToSave } = validateAddAnotherAddress({ addAnotherAddressOption, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#addAnotherAddressOption',
        name: 'addAnotherAddressOption',
        text: 'Do you want to add another address?',
      },
    ])
  })
})
