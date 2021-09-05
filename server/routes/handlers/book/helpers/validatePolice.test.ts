import { validatePolice } from './validatePolice'

describe('validatePolice', () => {
  it('returns valuesToSave and no errors if prison is submitted', () => {
    const requestBody = {
      localPoliceForce: 'Kent',
    }
    const { errors, valuesToSave } = validatePolice(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      localPoliceForce: 'Kent',
    })
  })

  it('returns no valuesToSave and an error if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validatePolice(requestBody)
    expect(errors).toEqual([
      {
        href: '#localPoliceForce',
        name: 'localPoliceForce',
        text: 'Local police force',
        values: {},
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })
})
