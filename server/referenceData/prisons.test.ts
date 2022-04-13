import { prisons } from './prisons'
import { getPrisons } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('prisons refdata', () => {
  it('fetches and formats a list of prisons, sorted alphabetically', () => {
    ;(getPrisons as jest.Mock).mockResolvedValue([
      {
        prisonId: 'ALI',
        prisonName: 'Albany (HMP)',
        active: false,
      },
      {
        prisonId: 'AKI',
        prisonName: 'Acklington (HMP)',
        active: true,
      },
    ])
    jest.useFakeTimers()
    const promise = prisons.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      expect(prisons.data).toEqual([
        {
          value: 'AKI',
          text: 'Acklington (HMP)',
          active: true,
        },
        {
          value: 'ALI',
          text: 'Albany (HMP)',
          active: false,
        },
      ])
      jest.useRealTimers()
    })
  })
})
