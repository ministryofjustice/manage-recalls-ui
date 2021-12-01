import { PoliceForce } from '../@types'
import { getPoliceForces } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { RefDataBaseClass } from './refDataBaseClass'

class PoliceForces extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getPoliceForces, formatList: PoliceForces.formatPoliceForceList })
  }

  static formatPoliceForceList(data: PoliceForce[]) {
    return data.map(({ id, name }: PoliceForce) => ({
      value: id,
      text: name,
    }))
  }
}

export const policeForces = new PoliceForces()
