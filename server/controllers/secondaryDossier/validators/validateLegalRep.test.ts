import { validateLegalRep } from './validateLegalRep'

describe('validateLegalRep', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'probation-officer' }
  const requestBody = {
    legalRepresentativeInfo_fullName: 'Dave Angel',
    legalRepresentativeInfo_email: 'probation.office@justice.com',
    legalRepresentativeInfo_phoneNumber: '07473739388',
  }

  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const { errors, valuesToSave } = validateLegalRep({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      legalRepresentativeInfo: {
        email: 'probation.office@justice.com',
        fullName: 'Dave Angel',
        phoneNumber: '07473739388',
      },
    })
  })

  it('redirects to view recall if fromPage not supplied', () => {
    const { redirectToPage } = validateLegalRep({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('redirects to fromPage if supplied', () => {
    const { redirectToPage } = validateLegalRep({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'dossier-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/dossier-recall')
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateLegalRep({ requestBody: emptyBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#legalRepresentativeInfo_fullName',
        name: 'legalRepresentativeInfo_fullName',
        text: 'Enter a name',
      },
      {
        href: '#legalRepresentativeInfo_email',
        name: 'legalRepresentativeInfo_email',
        text: 'Enter an email',
      },
      {
        href: '#legalRepresentativeInfo_phoneNumber',
        name: 'legalRepresentativeInfo_phoneNumber',
        text: 'Enter a phone number',
      },
    ])
  })

  it('returns errors for invalid email and phone, and no valuesToSave', () => {
    const { errors, valuesToSave } = validateLegalRep({
      requestBody: {
        ...requestBody,
        legalRepresentativeInfo_phoneNumber: '003139485349',
        legalRepresentativeInfo_email: 'probation.office',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#legalRepresentativeInfo_email',
        name: 'legalRepresentativeInfo_email',
        text: 'Enter an email address in the correct format, like name@example.com',
        values: 'probation.office',
      },
      {
        href: '#legalRepresentativeInfo_phoneNumber',
        name: 'legalRepresentativeInfo_phoneNumber',
        text: 'Enter a phone number in the correct format, like 01277 960901',
        values: '003139485349',
      },
    ])
  })
})
