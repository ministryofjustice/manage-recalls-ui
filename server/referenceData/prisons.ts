import { Prison, UiListItem } from '../@types'
import { getLocalDeliveryUnits, getPrisons } from '../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../logger'

class Prisons {
  private static instance: Prisons

  public data: UiListItem[]

  public active: UiListItem[]

  constructor() {
    if (Prisons.instance) {
      return Prisons.instance
    }
    Prisons.instance = this
  }

  formatPrisonList(data: Prison[]) {
    return data.map(({ prisonId, prisonName, active }: Prison) => ({
      value: prisonId,
      text: prisonName,
      active,
    }))
  }

  pollForData(intervalId: NodeJS.Timeout) {
    return getPrisons()
      .then(data => {
        if (data) {
          this.data = this.formatPrisonList(data)
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

export const prisons = new Prisons()
