import { validateDossierLetter } from './validateDossierLetter'

describe('validateDossierLetter', () => {
  it('returns valuesToSave and no errors if Yes + detail is submitted for both additionalLicenceConditions and differentNomsNumber', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'AC298345',
    }
    const { errors, valuesToSave } = validateDossierLetter(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      additionalLicenceConditions: true,
      additionalLicenceConditionsDetail: 'one, two',
      differentNomsNumber: true,
      differentNomsNumberDetail: 'AC298345',
    })
  })

  it('returns blank strings for detail fields and no errors if No is submitted for both additionalLicenceConditions and differentNomsNumber', () => {
    const requestBody = {
      additionalLicenceConditions: 'NO',
      differentNomsNumber: 'NO',
    }
    const { errors, valuesToSave } = validateDossierLetter(requestBody)
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      additionalLicenceConditions: false,
      additionalLicenceConditionsDetail: '',
      differentNomsNumber: false,
      differentNomsNumberDetail: '',
    })
  })

  it('returns an error for additionalLicenceConditions, if not set, and no valuesToSave', () => {
    const requestBody = {
      differentNomsNumber: 'NO',
    }
    const { errors, valuesToSave } = validateDossierLetter(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#additionalLicenceConditions',
        name: 'additionalLicenceConditions',
        text: 'Licence conditions',
      },
    ])
  })

  it('returns an error for differentNomsNumber, if not set, and no valuesToSave', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'Reasons',
    }
    const { errors, valuesToSave } = validateDossierLetter(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#differentNomsNumber',
        name: 'differentNomsNumber',
        text: 'Different NOMIS number',
      },
    ])
  })

  it('returns errors for additionalLicenceConditions and differentNomsNumber, if not set but Yes was checked, and no valuesToSave', () => {
    const requestBody = {
      additionalLicenceConditions: 'YES',
      differentNomsNumber: 'YES',
    }
    const { errors, valuesToSave } = validateDossierLetter(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#additionalLicenceConditionsDetail',
        name: 'additionalLicenceConditionsDetail',
        text: 'Provide detail on additional licence conditions',
      },
      {
        href: '#differentNomsNumberDetail',
        name: 'differentNomsNumberDetail',
        text: 'Provide the different NOMIS number',
      },
    ])
  })
})