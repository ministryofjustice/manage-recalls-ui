import { getCourts } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { Court } from '../@types/manage-recalls-api'
import { RefDataBaseClass } from './refDataBaseClass'

class Courts extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getCourts, formatList: Courts.formatCourtsList })
  }

  static formatCourtsList(list: Court[]) {
    return list.map(({ courtId, courtName }: Court) => ({
      value: courtId,
      text: courtName,
    }))
  }
}

export const courts = new Courts()
