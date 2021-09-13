import { validatePreConsName } from './validatePreConsName'

describe('validatePreConsName', () => {
  it('returns valuesToSave and no errors if Yes + detail is submitted', () => {
    const requestBody = {
      hasOtherPreviousConvictionMainName: 'YES',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      hasOtherPreviousConvictionMainName: true,
      previousConvictionMainName: 'Wayne Holt',
    })
  })

  it('returns blank string for detail field and no errors if No is submitted', () => {
    const requestBody = {
      hasOtherPreviousConvictionMainName: 'NO',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      hasOtherPreviousConvictionMainName: false,
      previousConvictionMainName: '',
    })
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      hasOtherPreviousConvictionMainName: '',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasOtherPreviousConvictionMainName',
        name: 'hasOtherPreviousConvictionMainName',
        text: 'What is the main name on the pre-cons?',
      },
    ])
  })

  it('returns an error for the name detail, if not set but Yes was checked, and no valuesToSave', () => {
    const requestBody = {
      hasOtherPreviousConvictionMainName: 'YES',
      previousConvictionMainName: '',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#previousConvictionMainName',
        name: 'previousConvictionMainName',
        text: 'What is the other main name used?',
      },
    ])
  })
})
