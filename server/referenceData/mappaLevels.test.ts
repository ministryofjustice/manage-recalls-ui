import { mappaLevels } from './mappaLevels'
import { getMappaLevels } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('MAPPA levels ref data', () => {
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

  it('fetches and formats a list of MAPPA levels', async () => {
    jest.useFakeTimers()
    const promise = mappaLevels.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
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
