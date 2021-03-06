import { validateDossierLetter } from './validateDossierLetter'

describe('validateDossierLetter', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'dossier-download' }

  it('returns valuesToSave and no errors if Yes + detail is submitted for both additionalLicenceConditions and differentNomsNumber', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'A1234AB',
    }
    const { errors, valuesToSave, redirectToPage } = validateDossierLetter({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      additionalLicenceConditions: true,
      additionalLicenceConditionsDetail: 'one, two',
      differentNomsNumber: true,
      differentNomsNumberDetail: 'A1234AB',
    })
    expect(redirectToPage).toEqual('/recalls/dossier-check')
  })

  it('returns no detail fields and no errors if No is submitted for both additionalLicenceConditions and differentNomsNumber', () => {
    const requestBody = {
      additionalLicenceConditions: 'NO',
      differentNomsNumber: 'NO',
    }
    const { errors, valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      additionalLicenceConditions: false,
      differentNomsNumber: false,
    })
  })

  it('returns empty strings for detail fields No is submitted for both and they have existing values', () => {
    const requestBody = {
      additionalLicenceConditions: 'NO',
      differentNomsNumber: 'NO',
      hasExistingAdditionalLicenceConditionsDetail: '1',
      hasExistingDifferentNomsNumberDetail: '1',
    }
    const { valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(valuesToSave).toEqual({
      additionalLicenceConditions: false,
      differentNomsNumber: false,
      additionalLicenceConditionsDetail: '',
      differentNomsNumberDetail: '',
    })
  })

  it('returns an error for additionalLicenceConditions, if not set, and no valuesToSave', () => {
    const requestBody = {
      differentNomsNumber: 'NO',
    }
    const { errors, valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#additionalLicenceConditions',
        name: 'additionalLicenceConditions',
        text: 'Are there additional licence conditions?',
      },
    ])
  })

  it("returns an error if the user didn't choose Yes or No for NOMIS number, and no valuesToSave", () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'Reasons',
    }
    const { errors, valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#differentNomsNumber',
        name: 'differentNomsNumber',
        text: 'Is <span data-private>{{ recall.fullName }}</span> being held under a different NOMIS number to the one on the licence?',
      },
    ])
  })

  it('returns an error for differentNomsNumberDetail, if invalid, and no valuesToSave', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'Reasons',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: '123',
    }
    const { errors, valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#differentNomsNumberDetail',
        name: 'differentNomsNumberDetail',
        text: 'Enter a NOMIS number in the correct format',
        values: '123',
      },
    ])
  })

  it('returns errors for additionalLicenceConditions and differentNomsNumber, if not set but Yes was checked, and no valuesToSave', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      differentNomsNumber: 'YES',
    }
    const { errors, valuesToSave } = validateDossierLetter({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#additionalLicenceConditionsDetail',
        name: 'additionalLicenceConditionsDetail',
        text: 'Provide more detail',
      },
      {
        text: 'Enter the NOMIS number <span data-private>{{ recall.fullName }}</span> is being held under',
        href: '#differentNomsNumberDetail',
        name: 'differentNomsNumberDetail',
      },
    ])
  })
})
