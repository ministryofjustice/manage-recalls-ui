import { validateStopReason } from './validateStopReason'
import { UrlInfo } from '../../../@types'

describe('validateStopReason', () => {
  const urlInfo = { basePath: '/recalls/', fromPage: 'view-recall' } as UrlInfo
  it('returns valuesToSave with a date, and no errors if all fields are submitted', () => {
    const requestBody = {
      stopReason: 'DECEASED',
    }
    const { errors, valuesToSave, confirmationMessage, redirectToPage } = validateStopReason({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      stopReason: 'DECEASED',
    })
    expect(confirmationMessage).toEqual({
      text: 'Recall stopped.',
      link: {
        text: 'View',
        href: '#recallDetails',
      },
      type: 'success',
    })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns errors if the stopReason field is missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validateStopReason({
      requestBody,
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#stopReason',
        name: 'stopReason',
        text: 'Why are you stopping this recall?',
      },
    ])
  })
})
