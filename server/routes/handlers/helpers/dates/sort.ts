import { DateTime } from 'luxon'
import { getProperty } from '../index'
import { RecallResponseLite } from '../../../../@types/manage-recalls-api/models/RecallResponseLite'

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

export const sortCompletedList = (completedList: RecallResponseLite[]) =>
  completedList.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    const dossierEmailSentDateA = moveDateToEndOfDay(getDateProperty(a, 'dossierEmailSentDate'))
    const lastUpdatedDateTimeA = getDateProperty(a, 'lastUpdatedDateTime')
    const dossierEmailSentDateB = moveDateToEndOfDay(getDateProperty(b, 'dossierEmailSentDate'))
    const lastUpdatedDateTimeB = getDateProperty(b, 'lastUpdatedDateTime')
    const dateA = dossierEmailSentDateA || lastUpdatedDateTimeA
    const dateB = dossierEmailSentDateB || lastUpdatedDateTimeB
    return diffDatesForSort(dateA, dateB, true)
  })

export const sortToDoList = (toDoList: RecallResponseLite[]) =>
  toDoList.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    const dossierTargetDateA = moveDateToEndOfDay(getDateProperty(a, 'dossierTargetDate'))
    const assessmentDueDateA = getDateProperty(a, 'recallAssessmentDueDateTime')
    const dossierTargetDateB = moveDateToEndOfDay(getDateProperty(b, 'dossierTargetDate'))
    const assessmentDueDateB = getDateProperty(b, 'recallAssessmentDueDateTime')
    let dateA = dossierTargetDateA || assessmentDueDateA
    let dateB = dossierTargetDateB || assessmentDueDateB
    if (!dateA || !dateB) {
      if (!dateA && dateB) {
        return -1
      }
      if (dateA && !dateB) {
        return 1
      }
      dateA = getDateProperty(a, 'createdDateTime')
      dateB = getDateProperty(b, 'createdDateTime')
    }
    return diffDatesForSort(dateA, dateB, false)
  })

export const sortNotInCustodyList = (notInCustodyList: RecallResponseLite[]) => {
  return notInCustodyList.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    if (a.status === 'RECALL_NOTIFICATION_ISSUED' && b.status !== 'RECALL_NOTIFICATION_ISSUED') {
      return -1
    }
    if (a.status !== 'RECALL_NOTIFICATION_ISSUED' && b.status === 'RECALL_NOTIFICATION_ISSUED') {
      return 1
    }
    return 0
  })
}
