import { reasonsForRecall } from './reasonsForRecall'
import { getReasonsForRecall } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('Reasons for recall ref data', () => {
  it('fetches and formats a list of reasons for recall', () => {
    ;(getReasonsForRecall as jest.Mock).mockResolvedValue([
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
    const promise = reasonsForRecall.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      expect(reasonsForRecall.data).toEqual([
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
