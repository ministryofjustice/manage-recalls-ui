import { validateRecallType } from './validateRecallType'

describe('validateRecallType', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'recall-type' }

  it('returns valuesToSave and no errors if Other is submitted', () => {
    const requestBody = {
      recommendedRecallType: 'FIXED',
    }
    const { errors, valuesToSave } = validateRecallType({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recommendedRecallType: 'FIXED',
    })
  })

  it('redirects to request-received if fromPage not supplied', () => {
    const requestBody = {
      recommendedRecallType: 'FIXED',
    }
    const { redirectToPage } = validateRecallType({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/request-received')
  })

  it('redirects to fromPage if supplied', () => {
    const requestBody = {
      recommendedRecallType: 'FIXED',
    }
    const { redirectToPage } = validateRecallType({ requestBody, urlInfo: { ...urlInfo, fromPage: 'view-recall' } })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      recommendedRecallType: '',
    }
    const { errors, valuesToSave } = validateRecallType({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recommendedRecallType',
        name: 'recommendedRecallType',
        text: 'What type of recall is being recommended?',
      },
    ])
  })
})
