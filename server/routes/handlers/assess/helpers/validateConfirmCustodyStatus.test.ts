import { validateConfirmCustodyStatus } from './validateConfirmCustodyStatus'

describe('validateConfirmCustodyStatus', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }

  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: true,
    })
  })

  it('sets redirectToPage to download notification, if answer is No', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { redirectToPage } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-download')
  })

  it('sets redirectToPage to current prison page, if answer is Yes ', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { redirectToPage } = validateConfirmCustodyStatus({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-prison')
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      inCustody: '',
    }
    const { errors, valuesToSave } = validateConfirmCustodyStatus({ requestBody, urlInfo })
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
