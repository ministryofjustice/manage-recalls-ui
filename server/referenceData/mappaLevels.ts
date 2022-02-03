import { getMappaLevels } from '../clients/manageRecallsApiClient'
import { MappaLevelResponse } from '../@types/manage-recalls-api/models/MappaLevelResponse'
import { RefDataBaseClass } from './refDataBaseClass'

class MappaLevels extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getMappaLevels, formatList: MappaLevels.formatMappaLevelsList })
  }

  static formatMappaLevelsList(list: MappaLevelResponse[]) {
    return list.map(({ id, name }: MappaLevelResponse) => ({
      value: id,
      text: name,
    }))
  }
}

export const mappaLevels = new MappaLevels()
