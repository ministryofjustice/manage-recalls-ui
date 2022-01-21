import { Prison } from '../@types'
import { getPrisons } from '../clients/manageRecallsApiClient'
import { RefDataBaseClass } from './refDataBaseClass'

class Prisons extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getPrisons, formatList: Prisons.formatPrisonList })
  }

  static formatPrisonList(data: Prison[]) {
    return data.map(({ prisonId, prisonName, active }: Prison) => ({
      value: prisonId,
      text: prisonName,
      active,
    }))
  }
}

export const prisons = new Prisons()
