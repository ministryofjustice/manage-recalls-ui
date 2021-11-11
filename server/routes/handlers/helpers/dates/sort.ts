import { DateTime } from 'luxon'
import { RecallResult } from '../../../../@types'
import { getProperty } from '../index'

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
    const dateA = getDateProperty(a, dateKey)
    const dateB = getDateProperty(b, dateKey)
    if (!dateA || !dateB) {
      return 0
    }
    return diffDatesForSort(dateA, dateB, newestFirst)
  })
}

export const moveDateToEndOfDay = (date: DateTime) => (date ? date.plus({ days: 1 }).minus({ seconds: 1 }) : undefined)

const getDateProperty = <T>(obj: T, dateKey: string) => {
  const val = getProperty<T, string>(obj, dateKey)
  return val ? DateTime.fromISO(val) : undefined
}

const diffDatesForSort = (dateA: DateTime, dateB: DateTime, newestFirst = true) => {
  if (!dateA || !dateB) {
    return 0
  }
  const diff = dateB.diff(dateA).toMillis()
  if (diff > 0) {
    return newestFirst ? 1 : -1
  }
  if (diff < 0) {
    return newestFirst ? -1 : 1
  }
  return 0
}

export const sortCompletedList = (completedList: RecallResult[]) =>
  completedList.sort((a: RecallResult, b: RecallResult): number => {
    const dossierEmailSentDateA = moveDateToEndOfDay(getDateProperty(a, 'recall.dossierEmailSentDate'))
    const lastUpdatedDateTimeA = getDateProperty(a, 'recall.lastUpdatedDateTime')
    const dossierEmailSentDateB = moveDateToEndOfDay(getDateProperty(b, 'recall.dossierEmailSentDate'))
    const lastUpdatedDateTimeB = getDateProperty(b, 'recall.lastUpdatedDateTime')
    const dateA = dossierEmailSentDateA || lastUpdatedDateTimeA
    const dateB = dossierEmailSentDateB || lastUpdatedDateTimeB
    return diffDatesForSort(dateA, dateB, true)
  })

export const sortToDoList = (toDoList: RecallResult[]) =>
  toDoList.sort((a: RecallResult, b: RecallResult): number => {
    const dossierTargetDateA = moveDateToEndOfDay(getDateProperty(a, 'recall.dossierTargetDate'))
    const assessmentDueDateA = getDateProperty(a, 'recall.recallAssessmentDueDateTime')
    const dossierTargetDateB = moveDateToEndOfDay(getDateProperty(b, 'recall.dossierTargetDate'))
    const assessmentDueDateB = getDateProperty(b, 'recall.recallAssessmentDueDateTime')
    let dateA = dossierTargetDateA || assessmentDueDateA
    let dateB = dossierTargetDateB || assessmentDueDateB
    if (!dateA || !dateB) {
      if (!dateA && dateB) {
        return -1
      }
      if (dateA && !dateB) {
        return 1
      }
      dateA = getDateProperty(a, 'recall.createdDateTime')
      dateB = getDateProperty(b, 'recall.createdDateTime')
    }
    return diffDatesForSort(dateA, dateB, false)
  })
