import { Prison, UiListItem } from '../@types'
import { getPrisonList } from '../data/prisonRegisterClient'

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

  async updateData() {
    const data = await getPrisonList()
    this.data = this.formatPrisonList(data)
  }
}

export const prisons = new Prisons()
