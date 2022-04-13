import { mappaLevels } from './mappaLevels'
import { getMappaLevels } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('MAPPA levels ref data', () => {
  it('fetches and formats a list of MAPPA levels', () => {
    ;(getMappaLevels as jest.Mock).mockResolvedValue([
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
    const promise = mappaLevels.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      expect(mappaLevels.data).toEqual([
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
