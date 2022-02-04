import { courts } from './courts'
import { getCourts } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('Courts ref data', () => {
  ;(getCourts as jest.Mock).mockResolvedValue([
    {
      courtId: 'TWO',
      courtName: 'Second one',
    },
    {
      courtId: 'ONE',
      courtName: 'First one',
    },
  ])

  it('fetches and formats a list of courts, sorted alphabetically', async () => {
    jest.useFakeTimers()
    const promise = courts.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      expect(courts.data).toEqual([
        {
          value: 'ONE',
          text: 'First one',
        },
        {
          value: 'TWO',
          text: 'Second one',
        },
      ])
      jest.useRealTimers()
    })
  })
})
