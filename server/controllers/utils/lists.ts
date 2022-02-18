import { ObjectMap } from '../../@types'
import { UploadedFileMetadata } from '../../@types/documents'

export const objectToArray = (obj: ObjectMap<unknown>): unknown[] => Object.values(obj)

export const sortList = <T>(list: T[], key: string, asc = true): T[] => {
  if (!Array.isArray(list)) {
    return undefined
  }
  return list.sort((a, b) => {
    if (a[key] < b[key]) {
      return asc ? -1 : 1
    }
    if (a[key] > b[key]) {
      return asc ? 1 : -1
    }
    return 0
  })
}

export const getLatestVersionFromList = <T>(list: T[]) => {
  const sorted = sortList<T>(list, 'version', true)
  return sorted[sorted.length - 1]
}

export const listToString = (list: string[], conjunction: string) => {
  if (list.length === 1) {
    return list[0]
  }
  const copy = [...list]
  if (conjunction) {
    const lastItem = copy.pop()
    return `${copy.join(', ')} ${conjunction} ${lastItem}`
  }
  copy.join(', ')
}

export const listDocumentLabels = (docs: UploadedFileMetadata[]) =>
  listToString(
    docs.map(doc => doc.label),
    'and'
  )
