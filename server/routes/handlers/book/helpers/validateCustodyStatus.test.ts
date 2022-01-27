import { validateCustodyStatus } from './validateCustodyStatus'

describe('validateCustodyStatus', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }

  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: true,
    })
  })

  it('sets redirectToPage to last known address, if answer is No and there is no fromPage', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { redirectToPage } = validateCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/last-known-address')
  })

  it('sets redirectToPage to last known address, if answer is No and there is a fromPage', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { redirectToPage } = validateCustodyStatus({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'check-answers' },
    })
    expect(redirectToPage).toEqual('/recalls/last-known-address?fromPage=check-answers')
  })

  it('sets redirectToPage to request received page, if answer is Yes and there is no fromPage', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { redirectToPage } = validateCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/last-known-address')
  })

  it('sets redirectToPage to the fromPage, if one is supplied and answer is Yes', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { redirectToPage } = validateCustodyStatus({ requestBody, urlInfo: { ...urlInfo, fromPage: 'view-recall' } })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      inCustody: '',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#inCustody',
        name: 'inCustody',
        text: 'Is {{ recall.fullName }} in custody?',
      },
    ])
  })
})
