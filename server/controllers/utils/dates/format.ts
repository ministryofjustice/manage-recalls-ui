import { DateTime, Duration } from 'luxon'
import logger from '../../../../logger'
import { europeLondon, getDateTimeInEuropeLondon, getDateTimeUTC } from './convert'
import { isDefined } from '../../../utils/utils'

const datePresentationFormat = 'd MMMM yyyy'
const datePresentationNoYearFormat = 'd MMM'
const timePresentationFormat = 'HH:mm'

export const formatDateTimeFromIsoString = (isoDate: string, dateOnly = false) => {
  const dateAndTimePresentationFormat = "d MMMM yyyy' at 'HH:mm"
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const includeTime = isoDate.length > 10 && !dateOnly
    const dateTime = getDateTimeInEuropeLondon(isoDate)

    if (includeTime) {
      return dateTime.toFormat(dateAndTimePresentationFormat)
    }
    return dateTime.toFormat(datePresentationFormat)
  } catch (err) {
    return ''
  }
}

export const recallAssessmentDueText = (isoDate: string): string | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    return dueDateLabel({
      dueItemLabel: 'Recall assessment',
      dueIsoDateTime: isoDate,
      includeTime: true,
      shortFormat: false,
    })
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const dossierDueDateString = (dueDateTime: string): string => {
  if (!isDefined(dueDateTime)) {
    return undefined
  }
  const now = DateTime.now()
  try {
    const overdue = now.diff(getDateTimeUTC(dueDateTime), 'days').days >= 1
    if (overdue) {
      return 'Overdue: Due on'
    }
    return 'Due on'
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const dueDateLabel = ({
  dueItemLabel,
  dueIsoDateTime,
  includeTime = true,
  shortFormat = false,
}: {
  dueItemLabel?: string
  dueIsoDateTime: string
  includeTime?: boolean
  shortFormat?: boolean
}): string => {
  if (!dueIsoDateTime) {
    return ''
  }
  const dueDateTime = getDateTimeUTC(dueIsoDateTime)
  const now = DateTime.now()
  const overdue = includeTime ? now.diff(dueDateTime).toMillis() >= 0 : now.diff(dueDateTime, 'days').days >= 1
  const startOfToday = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const earlierToday = overdue && startOfToday.diff(dueDateTime).toMillis() < 0
  const twentyFourHours = Duration.fromISO('PT24H')
  const endOfToday = startOfToday.plus(twentyFourHours).minus(1)
  const startOfYesterday = startOfToday.minus(twentyFourHours)
  const afterTomorrow = endOfToday.plus(twentyFourHours).diff(dueDateTime).toMillis() < 0
  const afterToday = afterTomorrow || endOfToday.diff(dueDateTime).toMillis() < 0
  const afterYesterday = overdue && startOfYesterday.diff(dueDateTime).toMillis() <= 0
  const dueForPresentation = dueDateTime.setZone(europeLondon)
  const dueDate = dueForPresentation.toFormat(datePresentationFormat)
  const dueDateNoYear = dueForPresentation.toFormat(datePresentationNoYearFormat)
  const dueTimeOfDay = includeTime
    ? `${shortFormat ? ' at ' : ' by '}${dueForPresentation.toFormat(timePresentationFormat)}`
    : ''
  if (afterTomorrow) {
    if (shortFormat) {
      return `${dueDateNoYear}${dueTimeOfDay}`
    }
    return `${dueItemLabel} will be due on ${dueDate}${dueTimeOfDay}`
  }
  if (afterToday) {
    if (shortFormat) {
      return `Tomorrow${dueTimeOfDay}`
    }
    return `${dueItemLabel} due tomorrow${dueTimeOfDay}`
  }
  if (earlierToday) {
    if (shortFormat) {
      return `Today${dueTimeOfDay}`
    }
    return `Overdue: ${dueItemLabel.toLowerCase()} was due today${dueTimeOfDay}`
  }
  if (overdue) {
    if (shortFormat) {
      if (afterYesterday) {
        return `Yesterday${dueTimeOfDay}`
      }
      return `${dueDateNoYear}${dueTimeOfDay}`
    }
    return `Overdue: ${dueItemLabel.toLowerCase()} was due on ${dueDate}${dueTimeOfDay}`
  }
  if (shortFormat) {
    return `Today${dueTimeOfDay}`
  }
  return `${dueItemLabel} due today${dueTimeOfDay}`
}

export const partBDueDateLabel = ({ partBDueDate }: { partBDueDate: string }): string => {
  const dueDateTime = getDateTimeUTC(partBDueDate)
  const now = DateTime.now()
  const overdue = now.diff(dueDateTime, 'days').days >= 1
  const startOfToday = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const isDueToday = startOfToday.diff(dueDateTime, 'days').days === 0
  const dueForPresentation = dueDateTime.setZone(europeLondon)
  const dueDate = dueForPresentation.toFormat(datePresentationFormat)

  if (isDueToday) {
    return `Today`
  }
  if (overdue) {
    return `Overdue`
  }
  return dueDate
}

export const padWithZeroes = (value?: number): string => {
  if (!isDefined(value)) {
    return ''
  }
  const padded = value.toString()
  return padded.length < 2 ? `0${padded}` : padded
}
