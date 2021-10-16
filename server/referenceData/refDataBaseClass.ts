import { UiListItem } from '../@types'
import logger from '../../logger'

export type FormatList<T> = (items: T) => UiListItem[]

export type FetchData<T> = () => Promise<T>

export abstract class RefDataBaseClass {
  private static instance: RefDataBaseClass

  private formatList: FormatList<unknown>

  private fetchData: FetchData<unknown>

  public data: UiListItem[]

  protected constructor({ fetchData, formatList }: { fetchData: FetchData<unknown>; formatList: FormatList<unknown> }) {
    if (RefDataBaseClass.instance) {
      return RefDataBaseClass.instance
    }
    RefDataBaseClass.instance = this
    this.formatList = formatList
    this.fetchData = fetchData
  }

  pollForData(intervalId: NodeJS.Timeout) {
    return this.fetchData()
      .then(data => {
        if (data) {
          this.data = this.formatList(data)
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
