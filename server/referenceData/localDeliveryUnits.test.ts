import { localDeliveryUnits } from './localDeliveryUnits'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApiClient'

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
    jest.useFakeTimers()
    const promise = localDeliveryUnits.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
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
      jest.useRealTimers()
    })
  })
})
