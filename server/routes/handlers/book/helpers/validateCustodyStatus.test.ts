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

  it('sets redirectToPage to licence-name if the person has middle names', () => {
    const requestBody = {
      inCustody: 'YES',
      hasMiddleNames: '1',
    }
    const { redirectToPage } = validateCustodyStatus(requestBody)
    expect(redirectToPage).toEqual('licence-name')
  })

  it('sets redirectToPage to pre-cons-name if the person does not have middle names', () => {
    const requestBody = {
      inCustody: 'YES',
    }
    const { redirectToPage } = validateCustodyStatus(requestBody)
    expect(redirectToPage).toEqual('pre-cons-name')
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
