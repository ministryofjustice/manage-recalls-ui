import { UiListItem } from '../@types'
import { getCourts, getLocalDeliveryUnits } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { Court } from '../@types/manage-recalls-api'
import logger from '../../logger'

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

  pollForData(intervalId: NodeJS.Timeout) {
    return getCourts()
      .then(data => {
        if (data) {
          this.data = this.formatCourtsList(data)
          clearInterval(intervalId)
        }
      })
      .catch(err => logger.error(err))
  }

  updateData() {
    return new Promise(resolve => {
      const intervalId = setInterval(() => {
        this.pollForData(intervalId).then(() => {
          resolve(true)
        })
      }, 5000)
    })
  }
}

export const courts = new Courts()
