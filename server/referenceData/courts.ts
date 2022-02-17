import { getCourts } from '../clients/manageRecallsApiClient'
import { Court } from '../@types/manage-recalls-api'
import { RefDataBaseClass } from './refDataBaseClass'
import { sortList } from '../controllers/utils/lists'

class Courts extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getCourts, formatList: Courts.formatCourtsList })
  }

  static formatCourtsList(list: Court[]) {
    const mapped = list.map(({ courtId, courtName }: Court) => ({
      value: courtId,
      text: courtName,
    }))
    return sortList(mapped, 'text')
  }
}

export const courts = new Courts()
