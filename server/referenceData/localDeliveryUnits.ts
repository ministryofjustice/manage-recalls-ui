import { UiListItem } from '../@types'
import { getLocalDeliveryUnits, getPrisons } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api'
import logger from '../../logger'

class LocalDeliveryUnits {
  private static instance: LocalDeliveryUnits

  public data: UiListItem[]

  constructor() {
    if (LocalDeliveryUnits.instance) {
      return LocalDeliveryUnits.instance
    }
    LocalDeliveryUnits.instance = this
  }

  formatLocalDeliveryUnitsList(list: LocalDeliveryUnitResponse[]) {
    return list.map(({ label, name }: LocalDeliveryUnitResponse) => ({
      value: name,
      text: label,
    }))
  }

  updateData() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        getLocalDeliveryUnits()
          .then(data => {
            if (data) {
              this.data = this.formatLocalDeliveryUnitsList(data)
              clearInterval(interval)
              resolve(true)
            }
          })
          .catch(err => logger.error(err))
      }, 10000)

    })
  }
}

export const localDeliveryUnits = new LocalDeliveryUnits()
