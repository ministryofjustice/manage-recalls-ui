import { getLocalDeliveryUnits } from '../clients/manageRecallsApiClient'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api'
import { RefDataBaseClass } from './refDataBaseClass'

class LocalDeliveryUnits extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getLocalDeliveryUnits, formatList: LocalDeliveryUnits.formatLocalDeliveryUnitsList })
  }

  static formatLocalDeliveryUnitsList(list: LocalDeliveryUnitResponse[]) {
    return list.map(({ label, name, active }: LocalDeliveryUnitResponse) => ({
      value: name,
      text: label,
      active,
    }))
  }
}

export const localDeliveryUnits = new LocalDeliveryUnits()
