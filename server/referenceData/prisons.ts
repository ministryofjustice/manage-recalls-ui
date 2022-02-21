import { Prison } from '../@types'
import { getPrisons } from '../clients/manageRecallsApiClient'
import { RefDataBaseClass } from './refDataBaseClass'
import { sortList } from '../controllers/utils/lists'

class Prisons extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getPrisons, formatList: Prisons.formatPrisonList })
  }

  static formatPrisonList(data: Prison[]) {
    const mapped = data.map(({ prisonId, prisonName, active }: Prison) => ({
      value: prisonId,
      text: prisonName,
      active,
    }))
    return sortList(mapped, 'text')
  }
}

export const prisons = new Prisons()
