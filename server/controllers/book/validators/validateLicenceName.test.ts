import { validateLicenceName } from './validateLicenceName'

describe('validateLicenceName', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'assess-prison' }

  it('returns blank string for detail field and no errors if first + last name is submitted', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_LAST',
    }
    const { errors, valuesToSave } = validateLicenceName({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceNameCategory: 'FIRST_LAST',
    })
  })

  it('returns blank string for detail field and no errors if first + middle + last name is submitted', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    }
    const { errors, valuesToSave } = validateLicenceName({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    })
  })

  it('redirects to pre-cons name if fromPage not supplied', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    }
    const { redirectToPage } = validateLicenceName({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/pre-cons-name')
  })

  it('redirects to fromPage if supplied', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    }
    const { redirectToPage } = validateLicenceName({ requestBody, urlInfo: { ...urlInfo, fromPage: 'view-recall' } })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      licenceNameCategory: '',
    }
    const { errors, valuesToSave } = validateLicenceName({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#licenceNameCategory',
        name: 'licenceNameCategory',
        text: "How does <span data-private>{{ recall.fullName }}</span>'s name appear on the licence?",
      },
    ])
  })
})
