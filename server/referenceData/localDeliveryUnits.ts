import { UiListItem } from '../@types'
import { getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api'

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

  async updateData() {
    const data = await getLocalDeliveryUnits()
    this.data = this.formatLocalDeliveryUnitsList(data)
  }
}

export const localDeliveryUnits = new LocalDeliveryUnits()
