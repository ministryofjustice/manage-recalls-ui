import { validatePrison } from './validatePrison'
import * as referenceDataExports from '../../../../referenceData'

describe('validatePrison', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      prisons: [
        {
          value: 'BAI',
          text: 'Belmarsh (HMP)',
        },
      ],
    })
  })

  it('returns valuesToSave and no errors if prison is submitted', () => {
    const requestBody = {
      currentPrison: 'BEL',
      currentPrisonInput: 'Belmarsh (HMP)',
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

  it("returns an error for invalid prison when there's an existing selection, and no valuesToSave", () => {
    const requestBody = {
      currentPrison: 'BAI',
      currentPrisonInput: '1235',
    }
    const { errors, valuesToSave } = validatePrison(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison from the list',
        values: '1235',
      },
    ])
  })

  it("returns an error for invalid prison when there's no existing selection, and no valuesToSave", () => {
    const requestBody = {
      currentPrison: '',
      currentPrisonInput: '1235',
    }
    const { errors, valuesToSave } = validatePrison(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison from the list',
        values: '1235',
      },
    ])
  })
})
