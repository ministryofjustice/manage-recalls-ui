import { validateLicence } from './validateLicence'

describe('validateLicence', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'assess-licence' }

  it('returns valuesToSave and no errors if licence conditions and one reason are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
    }
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED'],
    })
  })

  it('redirects to custody status page if not in custody and fromPage not supplied', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
    }
    const { redirectToPage } = validateLicence({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-custody-status')
  })

  it('redirects to fromPage if supplied and not in custody', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
    }
    const { redirectToPage } = validateLicence({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall', fromHash: 'licenceDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall#licenceDetails')
  })

  it('redirects to prison page if in custody and fromPage not supplied', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
      inCustody: '1',
    }
    const { redirectToPage } = validateLicence({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/assess-prison')
  })

  it('redirects to fromPage if supplied and in custody', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: 'FAILED_WORK_AS_APPROVED',
      inCustody: '1',
    }
    const { redirectToPage } = validateLicence({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall', fromHash: 'licenceDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall#licenceDetails')
  })

  it('returns valuesToSave and no errors if licence conditions and several reasons are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED', 'POOR_BEHAVIOUR_NON_COMPLIANCE', 'ELM_BREACH_EXCLUSION_ZONE'],
    }
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
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
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['OTHER', 'FAILED_WORK_AS_APPROVED'],
      reasonsForRecallOtherDetail: 'Other reasons',
    })
  })

  it('returns an empty string for Other detail if it previously had a value, and Other is not selected', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED'],
      hasExistingReasonsForRecallOtherDetail: '1',
    }
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['FAILED_WORK_AS_APPROVED'],
      reasonsForRecallOtherDetail: '',
    })
  })

  it('returns no valuesToSave and all errors if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toEqual([
      {
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'Enter the licence conditions breached',
      },
      {
        href: '#reasonsForRecall',
        name: 'reasonsForRecall',
        text: 'Select reasons for recall',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('returns no valuesToSave and one error if licence conditions but no reasons are submitted', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
    }
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toEqual([
      {
        href: '#reasonsForRecall',
        name: 'reasonsForRecall',
        text: 'Select reasons for recall',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('returns no valuesToSave and an error if Other is checked but no detail for it', () => {
    const requestBody = {
      licenceConditionsBreached: 'one, two',
      reasonsForRecall: ['POOR_BEHAVIOUR_NON_COMPLIANCE', 'OTHER'],
    }
    const { errors, valuesToSave } = validateLicence({ requestBody, urlInfo })
    expect(errors).toEqual([
      {
        href: '#reasonsForRecallOtherDetail',
        name: 'reasonsForRecallOtherDetail',
        text: 'Provide more detail',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })
})
