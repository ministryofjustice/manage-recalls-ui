import { courts } from './courts'
import { getCourts } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('formatCourtsList', () => {
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

  it('fetches and formats a list of Courts', async () => {
    await courts.updateData()
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
