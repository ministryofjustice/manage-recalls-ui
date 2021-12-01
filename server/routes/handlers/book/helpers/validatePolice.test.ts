import { validatePolice } from './validatePolice'
import * as referenceDataExports from '../../../../referenceData'

describe('validatePolice', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      policeForces: [
        {
          value: 'metropolitan',
          text: 'Metropolitan Police Service',
        },
      ],
    })
  })

  it('returns updateRecallRequest as valuesToSave and no errors if valid localPoliceForce is submitted', () => {
    const requestBody = {
      localPoliceForce: 'metropolitan',
      localPoliceForceInput: 'Metropolitan Police Service',
    }
    const { errors, valuesToSave } = validatePolice(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      localPoliceForceId: 'metropolitan',
      localPoliceForce: 'Metropolitan Police Service',
    })
  })
  it('returns no valuesToSave and an error if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validatePolice(requestBody)
    expect(errors).toEqual([
      {
        href: '#localPoliceForce',
        name: 'localPoliceForce',
        text: 'Select a local police force',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it("returns an error for invalid localPoliceForce entry when there's an existing selection, and no valuesToSave", () => {
    const requestBody = {
      localPoliceForce: 'metropolitan',
      localPoliceForceInput: '123',
    }
    const { errors, valuesToSave } = validatePolice(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localPoliceForce',
        name: 'localPoliceForce',
        text: 'Select a local police force from the list',
        values: '123',
      },
    ])
  })

  it("returns an error for invalid localPoliceForce entry when there's no existing selection, and no valuesToSave", () => {
    const requestBody = {
      localPoliceForce: '',
      localPoliceForceInput: '123',
    }
    const { errors, valuesToSave } = validatePolice(requestBody)

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localPoliceForce',
        name: 'localPoliceForce',
        text: 'Select a local police force from the list',
        values: '123',
      },
    ])
  })
})
