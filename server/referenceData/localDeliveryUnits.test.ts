import { localDeliveryUnits } from './localDeliveryUnits'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('Local Delivery Units ref data', () => {
  ;(getLocalDeliveryUnits as jest.Mock).mockResolvedValue([
    {
      name: 'ONE',
      label: 'First one',
    },
    {
      name: 'TWO',
      label: 'Second one',
    },
  ])

  it('fetches and formats a list of Local Delivery Units', async () => {
    const timeout = setTimeout(() => undefined, 1)
    await localDeliveryUnits.pollForData(timeout)
    expect(localDeliveryUnits.data).toEqual([
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
