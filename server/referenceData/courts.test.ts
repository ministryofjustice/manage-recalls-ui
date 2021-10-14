import { courts } from './courts'
import { getCourts } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('Courts ref data', () => {
  ;(getCourts as jest.Mock).mockResolvedValue([
    {
      courtId: 'ONE',
      courtName: 'First one',
    },
    {
      courtId: 'TWO',
      courtName: 'Second one',
    },
  ])

  it('fetches and formats a list of courts', async () => {
    const timeout = setTimeout(() => undefined, 1)
    await courts.pollForData(timeout)
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
  })
})
