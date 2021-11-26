import { validateLicenceName } from './validateLicenceName'

describe('validateLicenceName', () => {
  it('returns blank string for detail field and no errors if first + last name is submitted', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_LAST',
    }
    const { errors, valuesToSave } = validateLicenceName(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceNameCategory: 'FIRST_LAST',
    })
  })

  it('returns blank string for detail field and no errors if first + middle + last name is submitted', () => {
    const requestBody = {
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    }
    const { errors, valuesToSave } = validateLicenceName(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    })
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      licenceNameCategory: '',
    }
    const { errors, valuesToSave } = validateLicenceName(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#licenceNameCategory',
        name: 'licenceNameCategory',
        text: "How does {{ recall.fullName }}'s name appear on the licence?",
      },
    ])
  })
})
