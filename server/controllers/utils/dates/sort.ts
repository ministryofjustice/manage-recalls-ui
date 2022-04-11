import { DateTime } from 'luxon'
import { RecallResponseLite } from '../../../@types/manage-recalls-api/models/RecallResponseLite'
import { getProperty } from '../../../utils/utils'
import { RecallResponseLiteDecorated } from '../../../@types'

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
  return val ? DateTime.fromISO(val, { zone: 'utc' }) : undefined
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
  completedList
    .map(recall => {
      const dossierEmailSentDate = moveDateToEndOfDay(getDateProperty(recall, 'dossierEmailSentDate'))
      const lastUpdatedDateTime = getDateProperty(recall, 'lastUpdatedDateTime')
      const completedDateTime = dossierEmailSentDate || lastUpdatedDateTime
      return {
        ...recall,
        completedDateTime: completedDateTime?.setZone('utc').toString(),
      }
    })
    .sort((a: RecallResponseLiteDecorated, b: RecallResponseLiteDecorated): number => {
      const dateA = getDateProperty(a, 'completedDateTime')
      const dateB = getDateProperty(b, 'completedDateTime')
      return diffDatesForSort(dateA, dateB, true)
    })

export const sortToDoList = (toDoList: RecallResponseLite[]) =>
  toDoList
    .map(recall => {
      const dossierTargetDate = moveDateToEndOfDay(getDateProperty(recall, 'dossierTargetDate'))
      const assessmentDueDate = getDateProperty(recall, 'recallAssessmentDueDateTime')
      const toDoDueDateTime = dossierTargetDate || assessmentDueDate
      return {
        ...recall,
        toDoDueDateTime: toDoDueDateTime?.setZone('utc').toString(),
      }
    })
    .sort((a: RecallResponseLiteDecorated, b: RecallResponseLiteDecorated): number => {
      let dateA = getDateProperty(a, 'toDoDueDateTime')
      let dateB = getDateProperty(b, 'toDoDueDateTime')
      let newestFirst = false
      if (!dateA || !dateB) {
        if (!dateA && dateB) {
          return -1
        }
        if (dateA && !dateB) {
          return 1
        }
        dateA = getDateProperty(a, 'lastUpdatedDateTime')
        dateB = getDateProperty(b, 'lastUpdatedDateTime')
        newestFirst = true
      }
      return diffDatesForSort(dateA, dateB, newestFirst)
    })

export const sortNotInCustodyList = (notInCustodyList: RecallResponseLite[]) => {
  return notInCustodyList.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    if (a.status === 'ASSESSED_NOT_IN_CUSTODY' && b.status !== 'AWAITING_RETURN_TO_CUSTODY') {
      return -1
    }
    if (a.status !== 'AWAITING_RETURN_TO_CUSTODY' && b.status === 'ASSESSED_NOT_IN_CUSTODY') {
      return 1
    }
    return 0
  })
}

export const sortAwaitingPartBList = (awaitingPartBList: RecallResponseLite[]) => {
  return awaitingPartBList.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    const partBDueDateA = getDateProperty(a, 'partBDueDate')
    const partBDueDateB = getDateProperty(b, 'partBDueDate')
    return diffDatesForSort(partBDueDateA, partBDueDateB, false)
  })
}

export const sortDossierCheckList = (list: RecallResponseLite[]) => {
  return list.sort((a: RecallResponseLite, b: RecallResponseLite): number => {
    const dateA = getDateProperty(a, 'secondaryDossierDueDate')
    const dateB = getDateProperty(b, 'secondaryDossierDueDate')
    if (!dateA || !dateB) {
      if (!dateA && dateB) {
        return -1
      }
      if (dateA && !dateB) {
        return 1
      }
    }
    return diffDatesForSort(dateA, dateB, false)
  })
}
