import { validateConfirmCustodyStatus } from './validateConfirmCustodyStatus'

describe('validateConfirmCustodyStatus', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }

  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      inCustodyAtAssessment: 'NO',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustodyAtAssessment: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      inCustodyAtAssessment: 'YES',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustodyAtAssessment: true,
    })
  })

  it('sets redirectToPage to download notification, if answer is No', () => {
    const requestBody = {
      inCustodyAtAssessment: 'NO',
    }
    const { redirectToPage } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-download')
  })

  it('sets redirectToPage to current prison page, if answer is Yes ', () => {
    const requestBody = {
      inCustodyAtAssessment: 'YES',
    }
    const { redirectToPage } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-prison')
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      inCustodyAtAssessment: '',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#inCustodyAtAssessment',
        name: 'inCustodyAtAssessment',
        text: 'Is <span data-private>{{ recall.fullName }}</span> in custody?',
      },
    ])
  })
})
