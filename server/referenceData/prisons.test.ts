import { prisons } from './prisons'
import { getPrisons } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('prisons refdata', () => {
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

  it('fetches and formats a list of prisons', async () => {
    jest.useFakeTimers()
    const promise = prisons.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      expect(prisons.data).toEqual([
        {
          value: 'ALI',
          text: 'Albany (HMP)',
          active: false,
        },
        {
          value: 'AKI',
          text: 'Acklington (HMP)',
          active: true,
        },
      ])
      jest.useRealTimers()
    })
  })
})
