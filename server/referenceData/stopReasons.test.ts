import { stopReasons } from './stopReasons'
import { getStopReasons } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('Stop reasons ref data', () => {
  it('fetches and formats a list of stop reasons', () => {
    ;(getStopReasons as jest.Mock).mockResolvedValue([
      {
        id: 'ONE',
        name: 'First one',
      },
      {
        id: 'TWO',
        name: 'Second one',
      },
    ])
    jest.useFakeTimers()
    const promise = stopReasons.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      expect(stopReasons.data).toEqual([
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
