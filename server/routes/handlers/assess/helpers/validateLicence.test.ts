import { validateLicence } from './validateLicence'

describe('validateLicence', () => {
  it('returns valuesToSave and no errors if licence conditions and one reason are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
    }
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED'],
    })
  })
  it('returns valuesToSave and no errors if licence conditions and several reasons are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED', 'POOR_BEHAVIOUR_NON_COMPLIANCE', 'ELM_BREACH_EXCLUSION_ZONE'],
    }
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: requestBody.reasonsForRecall,
    })
  })

  it('returns valuesToSave and no errors if licence conditions and reasons are submitted including Other detail', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['OTHER', 'FAILED_WORK_AS_APPROVED'],
      reasonsForRecallOtherDetail: 'Other reasons',
    }
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['OTHER', 'FAILED_WORK_AS_APPROVED'],
      reasonsForRecallOtherDetail: 'Other reasons',
    })
  })

  it('returns no valuesToSave and all errors if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toEqual([
      {
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'Breached licence conditions',
      },
      {
        href: '#reasonsForRecall',
        name: 'reasonsForRecall',
        text: 'Reasons for recall',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('returns no valuesToSave and one error if licence conditions but no reasons are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
    }
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toEqual([
      {
        href: '#reasonsForRecall',
        name: 'reasonsForRecall',
        text: 'Reasons for recall',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('returns no valuesToSave and an error if Other is checked but no detail for it', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['POOR_BEHAVIOUR_NON_COMPLIANCE', 'OTHER'],
    }
    const { errors, valuesToSave } = validateLicence(requestBody)
    expect(errors).toEqual([
      {
        href: '#reasonsForRecallOtherDetail',
        name: 'reasonsForRecallOtherDetail',
        text: 'Reasons for recall - provide detail on Other',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })
})
