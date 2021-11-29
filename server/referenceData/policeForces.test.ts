import { policeForces } from './policeForces'
import { getPoliceForces } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('policeForces refdata', () => {
  ;(getPoliceForces as jest.Mock).mockResolvedValue([
    {
      id: 'avon-and-somerset',
      name: 'Avon and Somerset Constabulary',
    },
    {
      id: 'bedfordshire',
      name: 'Bedfordshire Police',
    },
    {
      id: 'cambridgeshire',
      name: 'Cambridgeshire Constabulary',
    },
  ])

  it('fetches and formats a list of policeForces', async () => {
    jest.useFakeTimers()
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      expect(policeForces.data).toEqual([
        {
          value: 'avon-and-somerset',
          text: 'Avon and Somerset Constabulary',
        },
        {
          value: 'bedfordshire',
          text: 'Bedfordshire Police',
        },
        {
          value: 'cambridgeshire',
          text: 'Cambridgeshire Constabulary',
        },
      ])
      jest.useRealTimers()
    })
  })
})
