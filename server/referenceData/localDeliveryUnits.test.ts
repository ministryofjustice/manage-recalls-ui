import { localDeliveryUnits } from './localDeliveryUnits'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('Local Delivery Units ref data', () => {
  ;(getLocalDeliveryUnits as jest.Mock).mockResolvedValue([
    {
      name: 'ONE',
      label: 'First one',
      active: true,
    },
    {
      name: 'TWO',
      label: 'Second one',
      active: false,
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
          active: true,
        },
        {
          value: 'TWO',
          text: 'Second one',
          active: false,
        },
      ])
      jest.useRealTimers()
    })
  })
})
