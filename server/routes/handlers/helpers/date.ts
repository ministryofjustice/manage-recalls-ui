import { DateTime } from 'luxon'
import { getProperty } from './index'

export const sortListByDateField = <T>({
  list,
  dateKey,
  newestFirst = true,
}: {
  list: T[]
  dateKey: string
  newestFirst?: boolean
}): T[] => {
  return list.sort((a, b): number => {
    const dateStrA = getProperty<T, string>(a, dateKey)
    const dateStrB = getProperty<T, string>(b, dateKey)
    const dateA = DateTime.fromISO(dateStrA)
    const dateB = DateTime.fromISO(dateStrB)
    const diff = dateB.diff(dateA).toMillis()
    if (diff > 0) {
      return newestFirst ? 1 : -1
    }
    if (diff < 0) {
      return newestFirst ? -1 : 1
    }
    return 0
  })
}
