import { validateCustodyStatus } from './validateCustodyStatus'

describe('validateCustodyStatus', () => {
  it('returns a value to save and no errors if No is submitted', () => {
    const requestBody = {
      inCustody: 'NO',
    }
    const { errors, valuesToSave } = validateCustodyStatus(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: false,
    })
  })

  it('returns a value to save and no errors if Yes is submitted', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { errors, valuesToSave } = validateCustodyStatus(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      inCustody: true,
    })
  })

  it('returns an error for the decision, if not set', () => {
    const requestBody = {
      inCustody: '',
    }
    const { errors, valuesToSave } = validateCustodyStatus(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#inCustody',
        name: 'inCustody',
        text: 'Is {{ recall.fullName }} in custody?',
      },
    ])
  })
})
