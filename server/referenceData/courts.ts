import { UiListItem } from '../@types'
import { getCourts } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { Court } from '../@types/manage-recalls-api'

class Courts {
  private static instance: Courts

  public data: UiListItem[]

  constructor() {
    if (Courts.instance) {
      return Courts.instance
    }
    Courts.instance = this
  }

  formatCourtsList(list: Court[]) {
    return list.map(({ courtId, courtName }: Court) => ({
      value: courtId,
      text: courtName,
    }))
  }

  async updateData() {
    const data = await getCourts()
    this.data = this.formatCourtsList(data)
  }
}

export const courts = new Courts()
