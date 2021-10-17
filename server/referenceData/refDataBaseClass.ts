import { UiListItem } from '../@types'
import logger from '../../logger'

export type FormatList<T> = (items: T) => UiListItem[]

export type FetchData<T> = () => Promise<T>

export abstract class RefDataBaseClass {
  private formatList: FormatList<unknown>

  private fetchData: FetchData<unknown>

  public data: UiListItem[]

  protected constructor({ fetchData, formatList }: { fetchData: FetchData<unknown>; formatList: FormatList<unknown> }) {
    this.formatList = formatList
    this.fetchData = fetchData
  }

  updateData() {
    return this.fetchData()
      .then(data => {
        if (data) {
          this.data = this.formatList(data)
        }
      })
      .catch(err => logger.error(err))
  }
}
