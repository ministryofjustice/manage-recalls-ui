import { validateIssuesNeeds } from './validateIssuesNeeds'

describe('validateIssuesNeeds', () => {
  it('returns valuesToSave and no errors if Yes + detail is submitted for both contraband and vulnerabilities, plus MAPPA level', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'Substance addiction',
      mappaLevel: 'LEVEL_1',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      contraband: true,
      contrabandDetail: 'Will smuggle',
      vulnerabilityDiversity: true,
      vulnerabilityDiversityDetail: 'Substance addiction',
      mappaLevel: 'LEVEL_1',
    })
  })

  it('returns blank strings for detail fields and no errors if No is submitted for both contraband and vulnerabilities, plus MAPPA level', () => {
    const requestBody = {
      contraband: 'NO',
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'LEVEL_3',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      contraband: false,
      contrabandDetail: '',
      vulnerabilityDiversity: false,
      mappaLevel: 'LEVEL_3',
      vulnerabilityDiversityDetail: '',
    })
  })

  it('returns an error for contraband, if not set, and no valuesToSave', () => {
    const requestBody = {
      vulnerabilityDiversity: 'NO',
      mappaLevel: 'LEVEL_3',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#contraband',
        name: 'contraband',
        text: 'Contraband',
      },
    ])
  })

  it('returns an error for vulnerability, if not set, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      mappaLevel: 'NA',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#vulnerabilityDiversity',
        name: 'vulnerabilityDiversity',
        text: 'Vulnerability issues or diversity needs',
      },
    ])
  })

  it('returns errors for contraband and vulnerability detail, if not set but Yes was checked, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      vulnerabilityDiversity: 'YES',
      mappaLevel: 'NA',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#contrabandDetail',
        name: 'contrabandDetail',
        text: 'Bring contraband to prison detail',
        values: {
          contraband: 'YES',
          vulnerabilityDiversity: 'YES',
        },
      },
      {
        href: '#vulnerabilityDiversityDetail',
        name: 'vulnerabilityDiversityDetail',
        text: 'Vulnerability issues or diversity needs detail',
        values: {
          contraband: 'YES',
          vulnerabilityDiversity: 'YES',
        },
      },
    ])
  })

  it('returns an error for MAPPA level, if not set, and no valuesToSave', () => {
    const requestBody = {
      contraband: 'YES',
      contrabandDetail: 'Reasons',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'More reasons',
    }
    const { errors, valuesToSave } = validateIssuesNeeds(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'MAPPA level',
      },
    ])
  })
})
