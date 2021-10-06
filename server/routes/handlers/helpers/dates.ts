import { DateTime, Settings } from 'luxon'
import { DatePartNames, DatePartsParsed, DateTimePart, DateValidationError, ObjectMap } from '../../../@types'
import logger from '../../../../logger'
import { isDefined } from './index'

const timeZone = 'Europe/London'
Settings.throwOnInvalid = true

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
      { zone: timeZone }
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
        { zone: timeZone }
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
    { zone: timeZone }
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
    const date = DateTime.fromISO(isoDate, { zone: 'utc' })
    const { year, month, day, hour, minute } = date.setZone(timeZone).toObject()
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
    const date = DateTime.fromISO(isoDate, { zone: 'utc' }).setZone(timeZone)

    if (includeTime) {
      return date.toFormat("d MMMM yyyy' at 'HH:mm")
    }
    return date.toFormat('d MMMM yyyy')
  } catch (err) {
    return ''
  }
}

export const dateHasError = (field: string | DateValidationError) => Boolean((field as DateValidationError).error)
