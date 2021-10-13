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

  updateData() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        getLocalDeliveryUnits()
          .then(data => {
            if (data) {
              this.data = this.formatLocalDeliveryUnitsList(data)
              clearInterval(interval)
              resolve(true)
            }
          })
          .catch(err => logger.error(err))
      }, 10000)

    })
  }
  async updateData() {
    let data
    const interval = setInterval(() => {
      ;(async () => {
        data = await getPrisons()
        if (data) {
          this.data = this.formatPrisonList(data)
          clearInterval(interval)
        }
      })()
    }, 10000)
  }
}

export const prisons = new Prisons()
