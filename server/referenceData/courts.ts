import { UiListItem } from '../@types'
import { getCourts, getPrisons } from '../clients/manageRecallsApi/manageRecallsApiClient'
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
    let data
    const interval = setInterval(() => {
      ;(async () => {
        data = await getCourts()
        if (data) {
          this.data = this.formatCourtsList(data)
          clearInterval(interval)
        }
      })()
    }, 10000)
  }
}

export const courts = new Courts()
