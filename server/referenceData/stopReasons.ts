import { getStopReasons } from '../clients/manageRecallsApiClient'
import { StopReasonResponse } from '../@types/manage-recalls-api/models/StopReasonResponse'
import { RefDataBaseClass } from './refDataBaseClass'

class StopReasons extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getStopReasons, formatList: StopReasons.formatList })
  }

  static formatList(list: StopReasonResponse[]) {
    return list.map(({ id, name, validForStopCall }: StopReasonResponse) => ({
      value: id,
      text: name,
      active: validForStopCall,
    }))
  }
}

export const stopReasons = new StopReasons()
