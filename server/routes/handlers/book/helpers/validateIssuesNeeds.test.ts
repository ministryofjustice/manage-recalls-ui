import { validateIssuesNeeds } from './validateIssuesNeeds'

describe('validateIssuesNeeds', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'custody-status' }
  it('returns valuesToSave and no errors if Yes + detail is submitted for contraband, arrest issues and vulnerabilities, plus MAPPA level', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'Substance addiction',
      arrestIssues: 'YES',
      arrestIssuesDetail: 'Details',
      mappaLevel: 'LEVEL_1',
      notInCustody: '1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      contraband: true,
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: true,
      vulnerabilityDiversityDetail: 'Substance addiction',
      arrestIssues: true,
      arrestIssuesDetail: 'Details',
      mappaLevel: 'LEVEL_1',
    })
  })

  it('does not return valuesToSave for arrest issues if notInCustody is not set', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'Substance addiction',
      arrestIssues: 'YES',
      arrestIssuesDetail: 'Details',
      mappaLevel: 'LEVEL_1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      contraband: true,
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: true,
      vulnerabilityDiversityDetail: 'Substance addiction',
      mappaLevel: 'LEVEL_1',
    })
  })

  it('returns no detail fields and no errors if No is submitted for contraband, arrest issues and vulnerabilities, plus MAPPA level', () => {
    const requestBody = {
      contraband: 'NO',
      vulnerabilityDiversity: 'NO',
      arrestIssues: 'NO',
      mappaLevel: 'LEVEL_3',
      notInCustody: '1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      contraband: false,
      vulnerabilityDiversity: false,
      arrestIssues: false,
      mappaLevel: 'LEVEL_3',
      arrestIssuesDetail: '',
      contrabandDetail: '',
      vulnerabilityDiversityDetail: '',
    })
  })

  it('returns an error for contraband, if not set, and no valuesToSave', () => {
    const requestBody = {
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'LEVEL_3',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#contraband',
        name: 'contraband',
        text: 'Do you think {{ recall.fullName }} will bring contraband into prison?',
      },
    ])
  })

  it('returns an error for vulnerability, if not set, and no valuesToSave', () => {
    const requestBody = {
      arrestIssues: 'NO',
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      mappaLevel: 'NA',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#vulnerabilityDiversity',
        name: 'vulnerabilityDiversity',
        text: 'Are there any vulnerability issues or diversity needs?',
      },
    ])
  })

  it('returns an error for arrest issues, if not set, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'NA',
      notInCustody: '1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#arrestIssues',
        name: 'arrestIssues',
        text: 'Are there any arrest issues?',
      },
    ])
  })

  it('does not return an error for arrest issues, if not set, is notInCustody is not set', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'NA',
    }
    const { errors } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
  })

  it('returns errors for contraband, arrest issues and vulnerability detail, if not set but Yes was checked, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      vulnerabilityDiversity: 'YES',
      arrestIssues: 'YES',
      mappaLevel: 'NA',
      notInCustody: '1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#vulnerabilityDiversityDetail',
        name: 'vulnerabilityDiversityDetail',
        text: 'Provide more detail for any vulnerability issues or diversity needs',
      },
      {
        href: '#arrestIssuesDetail',
        name: 'arrestIssuesDetail',
        text: 'Provide more detail for any arrest issues',
      },
      {
        href: '#contrabandDetail',
        name: 'contrabandDetail',
        text: 'Provide more detail on why you think {{ recall.fullName }} will bring contraband into prison',
      },
    ])
  })

  it('does not return an error for arrest issues if not set but Yes was checked, and notInCustody is not set', () => {
    const requestBody = {
      contraband: 'NO',
      vulnerabilityDiversity: 'NO',
      arrestIssues: 'YES',
      mappaLevel: 'NA',
    }
    const { errors } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
  })

  it('returns an error for MAPPA level, if not set, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'More reasons',
      arrestIssues: 'NO',
    }
    const { errors, valuesToSave } = validateIssuesNeeds({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'Select a MAPPA level',
      },
    ])
  })

  it('sets redirectToPage to fromPage, if one is supplied', () => {
    const requestBody = {
      contraband: 'NO',
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'NA',
    }
    const { redirectToPage } = validateIssuesNeeds({
      requestBody,
      urlInfo: { basePath: '/recalls/', currentPage: 'issues-needs', fromPage: 'check-answers' },
    })
    expect(redirectToPage).toEqual('/recalls/check-answers')
  })

  it('sets redirectToPage to probation details, if fromPage is not supplied', () => {
    const requestBody = {
      contraband: 'NO',
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'NA',
    }
    const { redirectToPage } = validateIssuesNeeds({
      requestBody,
      urlInfo,
    })
    expect(redirectToPage).toEqual('/recalls/probation-officer')
  })
})
