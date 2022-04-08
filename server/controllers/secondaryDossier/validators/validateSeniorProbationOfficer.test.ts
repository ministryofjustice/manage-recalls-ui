import { validateSeniorProbationOfficer } from './validateSeniorProbationOfficer'

describe('validateSeniorProbationOfficer', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'probation-officer' }
  const requestBody = {
    seniorProbationOfficerInfo_fullName: 'Dave Angel',
    seniorProbationOfficerInfo_email: 'probation.office@justice.com',
    seniorProbationOfficerInfo_phoneNumber: '07473739388',
  }

  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const { errors, valuesToSave } = validateSeniorProbationOfficer({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      seniorProbationOfficerInfo: {
        email: 'probation.office@justice.com',
        fullName: 'Dave Angel',
        phoneNumber: '07473739388',
      },
    })
  })

  it('redirects to view recall if fromPage not supplied', () => {
    const { redirectToPage } = validateSeniorProbationOfficer({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('redirects to fromPage if supplied', () => {
    const { redirectToPage } = validateSeniorProbationOfficer({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'dossier-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/dossier-recall')
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateSeniorProbationOfficer({ requestBody: emptyBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#seniorProbationOfficerInfo_fullName',
        name: 'seniorProbationOfficerInfo_fullName',
        text: 'Enter a name',
      },
      {
        href: '#seniorProbationOfficerInfo_email',
        name: 'seniorProbationOfficerInfo_email',
        text: 'Enter an email',
      },
      {
        href: '#seniorProbationOfficerInfo_phoneNumber',
        name: 'seniorProbationOfficerInfo_phoneNumber',
        text: 'Enter a phone number',
      },
    ])
  })

  it('returns errors for invalid email and phone, and no valuesToSave', () => {
    const { errors, valuesToSave } = validateSeniorProbationOfficer({
      requestBody: {
        ...requestBody,
        seniorProbationOfficerInfo_phoneNumber: '003139485349',
        seniorProbationOfficerInfo_email: 'probation.office',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#seniorProbationOfficerInfo_email',
        name: 'seniorProbationOfficerInfo_email',
        text: 'Enter an email address in the correct format, like name@example.com',
        values: 'probation.office',
      },
      {
        href: '#seniorProbationOfficerInfo_phoneNumber',
        name: 'seniorProbationOfficerInfo_phoneNumber',
        text: 'Enter a phone number in the correct format, like 01277 960901',
        values: '003139485349',
      },
    ])
  })
})
