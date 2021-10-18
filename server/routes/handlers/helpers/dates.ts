import { DateTime, Duration, Settings } from 'luxon'
import { DatePartNames, DatePartsParsed, DateTimePart, DateValidationError, ObjectMap } from '../../../@types'
import logger from '../../../../logger'
import { areStringArraysTheSame, isDefined } from './index'

Settings.throwOnInvalid = true

const europeLondon = 'Europe/London'
const datePresentationFormat = 'd MMMM yyyy'
const timePresentationFormat = 'HH:mm'
const dateAndTimePresentationFormat = "d MMMM yyyy' at 'HH:mm"

interface Options {
  includeTime?: boolean
  dateMustBeInPast?: boolean
  dateMustBeInFuture?: boolean
}

const parseDateTimeParts = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value }) => (value === '' ? name : undefined)).filter(Boolean)

export const convertGmtDatePartsToUtc = (
  { year, month, day, hour, minute }: ObjectMap<string>,
  options: Options = {}
): string | DateValidationError => {
  if ([year, month, day, hour, minute].every(part => !isDefined(part) || part === '')) {
    return {
      error: 'blankDateTime',
    }
  }
  const dateParts = [
    { name: 'day', value: day },
    { name: 'month', value: month },
    { name: 'year', value: year },
  ]
  let timeParts = [] as DateTimePart[]
  if (options.includeTime) {
    timeParts = [
      { name: 'hour', value: hour },
      { name: 'minute', value: minute },
    ]
    const dateTimePartErrors = parseDateTimeParts([...dateParts, ...timeParts])
    if (dateTimePartErrors.length) {
      if (areStringArraysTheSame(dateTimePartErrors, ['day', 'month', 'year'])) {
        return {
          error: 'missingDate',
        }
      }
      if (areStringArraysTheSame(dateTimePartErrors, ['hour', 'minute'])) {
        return {
          error: 'missingTime',
        }
      }
      return {
        error: 'missingDateParts',
        invalidParts: dateTimePartErrors,
      }
    }
  }
  const datePartErrors = parseDateTimeParts(dateParts)
  if (datePartErrors.length) {
    return {
      error: 'missingDateParts',
      invalidParts: datePartErrors,
    }
  }
  const [d, m, y, h, min] = [...dateParts, ...timeParts].map(({ value }) => {
    return parseInt(value, 10)
  })
  try {
    DateTime.fromObject(
      {
        year: y,
        month: m,
        day: d,
      },
      { zone: europeLondon }
    )
  } catch (err) {
    return { error: 'invalidDate' }
  }
  if (options.includeTime) {
    try {
      DateTime.fromObject(
        {
          hour: h,
          minute: min,
        },
        { zone: europeLondon }
      )
    } catch (err) {
      return { error: 'invalidTime' }
    }
  }
  const date = DateTime.fromObject(
    {
      year: y,
      month: m,
      day: d,
      hour: h,
      minute: min,
    },
    { zone: europeLondon }
  )
  if (options) {
    const now = DateTime.now()
    if (options.dateMustBeInPast === true && now < date) {
      return { error: 'dateMustBeInPast' }
    }
    if (options.dateMustBeInFuture === true && now > date) {
      return { error: 'dateMustBeInFuture' }
    }
  }
  if (options.includeTime) {
    return date.setZone('utc').toString()
  }
  return date.toISODate()
}

export const splitIsoDateToParts = (isoDate?: string): DatePartsParsed | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const includeTime = isoDate.length > 10
    const dateTime = getDateTimeInEuropeLondon(isoDate)
    const { year, month, day, hour, minute } = dateTime.toObject()
    if (includeTime) {
      return { year, month, day, hour, minute }
    }
    return { year, month, day }
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const formatDateTimeFromIsoString = (isoDate: string) => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const includeTime = isoDate.length > 10
    const dateTime = getDateTimeInEuropeLondon(isoDate)

    if (includeTime) {
      return dateTime.toFormat(dateAndTimePresentationFormat)
    }
    return dateTime.toFormat(datePresentationFormat)
  } catch (err) {
    return ''
  }
}

export const dateHasError = (field: string | DateValidationError) => Boolean((field as DateValidationError).error)

export const recallAssessmentDueText = (isoDate: string): string | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    return recallAssessmentDueString(getDateTimeUTC(isoDate))
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const recallAssessmentDueString = (dueDateTime: DateTime): string => {
  const now = DateTime.now()
  const overdue = now.diff(dueDateTime).toMillis() >= 0
  const startOfToday = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const earlierToday = overdue && startOfToday.diff(dueDateTime).toMillis() < 0
  const twentyFourHours = Duration.fromISO('PT24H')
  const endOfToday = startOfToday.plus(twentyFourHours)
  const afterTomorrow = endOfToday.plus(twentyFourHours).diff(dueDateTime).toMillis() < 0
  const afterToday = afterTomorrow || endOfToday.diff(dueDateTime).toMillis() < 0
  const dueForPresentation = dueDateTime.setZone(europeLondon)
  const dueDate = dueForPresentation.toFormat(datePresentationFormat)
  const dueTimeOfDay = dueForPresentation.toFormat(timePresentationFormat)
  if (afterTomorrow) {
    return `Recall assessment will be due on ${dueDate} by ${dueTimeOfDay}`
  }
  if (afterToday) {
    return `Recall assessment due tomorrow by ${dueTimeOfDay}`
  }
  if (earlierToday) {
    return `Overdue: recall assessment was due today by ${dueTimeOfDay}`
  }
  if (overdue) {
    return `Overdue: recall assessment was due on ${dueDate} by ${dueTimeOfDay}`
  }
  return `Recall assessment due today by ${dueTimeOfDay}`
}

function getDateTimeUTC(isoDate: string) {
  return DateTime.fromISO(isoDate, { zone: 'utc' })
}

function getDateTimeInEuropeLondon(isoDate: string) {
  return getDateTimeUTC(isoDate).setZone(europeLondon)
}
