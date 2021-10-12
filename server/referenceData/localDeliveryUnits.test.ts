import { localDeliveryUnits } from './localDeliveryUnits'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('formatLocalDeliveryUnitsList', () => {
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
    await localDeliveryUnits.updateData()
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
