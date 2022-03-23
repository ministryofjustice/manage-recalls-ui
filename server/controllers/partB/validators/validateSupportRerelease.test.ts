import { validateSupportRerelease } from './validateSupportRerelease'

describe('validateSupportRerelease', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }

  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      rereleaseSupported: 'NO',
    }
    const { errors, valuesToSave } = validateSupportRerelease({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      rereleaseSupported: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      rereleaseSupported: 'YES',
    }
    const { errors, valuesToSave } = validateSupportRerelease({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      rereleaseSupported: true,
    })
  })

  it('sets redirectToPage to view recall, if there is no fromPage', () => {
    const requestBody = {
      rereleaseSupported: 'NO',
    }
    const { redirectToPage } = validateSupportRerelease({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('sets redirectToPage to the fromPage, if one is supplied', () => {
    const requestBody = {
      rereleaseSupported: 'YES',
    }
    const { redirectToPage } = validateSupportRerelease({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall', fromHash: 'custodyDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall#custodyDetails')
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      rereleaseSupported: '',
    }
    const { errors, valuesToSave } = validateSupportRerelease({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rereleaseSupported',
        name: 'rereleaseSupported',
        text: 'Do probation support re-release?',
      },
    ])
  })
})
