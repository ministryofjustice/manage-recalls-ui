import { validatePreConsName } from './validatePreConsName'

describe('validatePreConsName', () => {
  it('returns valuesToSave and no errors if Other is submitted', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    })
  })

  it('returns blank string for detail field and no errors if first + last name is submitted', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'FIRST_LAST',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      previousConvictionMainNameCategory: 'FIRST_LAST',
      previousConvictionMainName: '',
    })
  })

  it('returns blank string for detail field and no errors if first + middle + last name is submitted', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(errors).toBeUndefined()
    // NOTE - should be blank strings for detail fields, not null, so that existing DB values are overwritten
    expect(valuesToSave).toEqual({
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: '',
    })
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      previousConvictionMainNameCategory: '',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#previousConvictionMainNameCategory',
        name: 'previousConvictionMainNameCategory',
        text: "Is {{ recall.fullName }}'s name different on the previous convictions report (pre-cons)?",
      },
    ])
  })

  it('returns an error for the name detail, if not set but Other was checked, and no valuesToSave', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: '',
    }
    const { errors, valuesToSave } = validatePreConsName(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#previousConvictionMainName',
        name: 'previousConvictionMainName',
        text: 'Enter the name on the pre-cons',
      },
    ])
  })
})
