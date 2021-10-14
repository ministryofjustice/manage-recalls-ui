import { UiListItem } from '../@types'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'
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

  pollForData(intervalId: NodeJS.Timeout) {
    return getLocalDeliveryUnits()
      .then(data => {
        if (data) {
          this.data = this.formatLocalDeliveryUnitsList(data)
          clearInterval(intervalId)
        }
      })
      .catch(err => logger.error(err))
  }

  updateData() {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        this.pollForData(intervalId).then(() => {
          resolve(true)
        })
      }, 5000)
    })
  }
}

export const localDeliveryUnits = new LocalDeliveryUnits()
