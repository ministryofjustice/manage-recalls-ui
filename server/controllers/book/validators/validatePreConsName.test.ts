import { validatePreConsName } from './validatePreConsName'

describe('validatePreConsName', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'prison-police' }

  it('returns valuesToSave and no errors if Other is submitted', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    })
  })

  it('redirects to custody status if fromPage not supplied', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { redirectToPage } = validatePreConsName({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/custody-status')
  })

  it('redirects to fromPage if supplied', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { redirectToPage } = validatePreConsName({ requestBody, urlInfo: { ...urlInfo, fromPage: 'view-recall' } })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns no detail field and no errors if first + middle + last name is submitted', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: 'Wayne Holt',
    }
    const { errors, valuesToSave } = validatePreConsName({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
    })
  })

  it('returns empty string for detail field if it has an existing value and Other is not selected', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: 'Wayne Holt',
      hasExistingPreviousConvictionMainName: '1',
    }
    const { valuesToSave } = validatePreConsName({ requestBody, urlInfo })
    expect(valuesToSave).toEqual({
      previousConvictionMainName: '',
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
    })
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      previousConvictionMainNameCategory: '',
    }
    const { errors, valuesToSave } = validatePreConsName({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#previousConvictionMainNameCategory',
        name: 'previousConvictionMainNameCategory',
        text: "How does <span data-private>{{ recall.fullName }}</span>'s name appear on the previous convictions sheet (pre-cons)?",
      },
    ])
  })

  it('returns an error for the name detail, if not set but Other was checked, and no valuesToSave', () => {
    const requestBody = {
      previousConvictionMainNameCategory: 'OTHER',
      previousConvictionMainName: '',
    }
    const { errors, valuesToSave } = validatePreConsName({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#previousConvictionMainName',
        name: 'previousConvictionMainName',
        text: 'Enter the full name on the pre-cons',
      },
    ])
  })
})
