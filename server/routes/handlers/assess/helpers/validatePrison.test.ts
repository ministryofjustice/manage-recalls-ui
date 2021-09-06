import { validatePrison } from './validatePrison'

describe('validatePrison', () => {
  it('returns valuesToSave and no errors if prison is submitted', () => {
    const requestBody = {
      currentPrison: 'BEL',
    }
    const { errors, valuesToSave } = validatePrison(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      currentPrison: 'BEL',
    })
  })

  it('returns no valuesToSave and an error if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validatePrison(requestBody)
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })
})
