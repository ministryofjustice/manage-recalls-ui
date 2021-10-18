import { getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api'
import { RefDataBaseClass } from './refDataBaseClass'

class LocalDeliveryUnits extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getLocalDeliveryUnits, formatList: LocalDeliveryUnits.formatLocalDeliveryUnitsList })
  }

  static formatLocalDeliveryUnitsList(list: LocalDeliveryUnitResponse[]) {
    return list.map(({ label, name }: LocalDeliveryUnitResponse) => ({
      value: name,
      text: label,
    }))
  }
}

export const localDeliveryUnits = new LocalDeliveryUnits()
