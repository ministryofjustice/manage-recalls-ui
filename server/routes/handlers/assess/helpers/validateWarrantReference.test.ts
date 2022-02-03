import { validateWarrantReference } from './validateWarrantReference'

describe('validateWarrantReference', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'warrant-reference' }

  it('returns valuesToSave, redirect, and no errors if Yes + detail is submitted', () => {
    const requestBody = {
      warrantReferenceNumber: '04RC/6457367A74325',
    }
    const { errors, valuesToSave, redirectToPage } = validateWarrantReference({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      warrantReferenceNumber: '04RC/6457367A74325',
    })
    expect(redirectToPage).toEqual('/recalls/view-recall?fromPage=/&fromHash=notInCustody')
  })

  it('returns an error for the warrant reference, if not set', () => {
    const { errors, valuesToSave } = validateWarrantReference({ requestBody: {}, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#warrantReferenceNumber',
        name: 'warrantReferenceNumber',
        text: 'What is the warrant reference number?',
      },
    ])
  })
})
