import { validateCustodyStatus } from './validateCustodyStatus'

describe('validateCustodyStatus', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }

  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      inCustodyAtBooking: 'NO',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustodyAtBooking: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      inCustodyAtBooking: 'YES',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustodyAtBooking: true,
    })
  })

  it('sets redirectToPage to last known address, if answer is No and there is no fromPage', () => {
    const requestBody = {
      inCustodyAtBooking: 'NO',
    }
    const { redirectToPage } = validateCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/last-known-address')
  })

  it('sets redirectToPage to last known address, if answer is No and there is a fromPage', () => {
    const requestBody = {
      inCustodyAtBooking: 'NO',
    }
    const { redirectToPage } = validateCustodyStatus({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'check-answers', fromHash: 'custodyDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/last-known-address?fromPage=check-answers&fromHash=custodyDetails')
  })

  it('sets redirectToPage to request received page, if answer is Yes and there is no fromPage', () => {
    const requestBody = {
      inCustodyAtBooking: 'YES',
    }
    const { redirectToPage } = validateCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/request-received')
  })

  it('sets redirectToPage to the fromPage, if one is supplied and answer is Yes', () => {
    const requestBody = {
      inCustodyAtBooking: 'YES',
    }
    const { redirectToPage } = validateCustodyStatus({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall', fromHash: 'custodyDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall#custodyDetails')
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      inCustodyAtBooking: '',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#inCustodyAtBooking',
        name: 'inCustodyAtBooking',
        text: 'Is {{ recall.fullName }} in custody?',
      },
    ])
  })
})
