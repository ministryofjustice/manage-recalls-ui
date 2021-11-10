import { DateTime, Settings } from 'luxon'
import { DatePartNames, DatePartsParsed, DateTimePart, DateValidationError, ObjectMap } from '../../../../@types'
import { areStringArraysTheSame, isDefined } from '../index'
import { padWithZeroes } from './format'
import logger from '../../../../../logger'

Settings.throwOnInvalid = true

export const europeLondon = 'Europe/London'

interface Options {
  includeTime?: boolean
  dateMustBeInPast?: boolean
  dateMustBeInFuture?: boolean
}

const filterPartsForEmptyStrings = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value }) => (value === '' ? name : undefined)).filter(Boolean)

const filterPartsForMinimumLength = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value, minLength }) => (value.length < (minLength || 2) ? name : undefined)).filter(Boolean)

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
    { name: 'year', value: year, minLength: 4 },
  ]
  let timeParts = [] as DateTimePart[]
  if (options.includeTime) {
    timeParts = [
      { name: 'hour', value: hour },
      { name: 'minute', value: minute },
    ]
    let dateTimePartErrors = filterPartsForEmptyStrings([...dateParts, ...timeParts])
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
    dateTimePartErrors = filterPartsForMinimumLength([...dateParts, ...timeParts])
    if (dateTimePartErrors.length) {
      return {
        error: 'minLengthDateTimeParts',
        invalidParts: dateTimePartErrors,
      }
    }
  }
  let datePartErrors = filterPartsForEmptyStrings(dateParts)
  if (datePartErrors.length) {
    return {
      error: 'missingDateParts',
      invalidParts: datePartErrors,
    }
  }

  datePartErrors = filterPartsForMinimumLength(dateParts)
  if (datePartErrors.length) {
    return {
      error: 'minLengthDateParts',
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
    const paddedDate = { year: year.toString(), month: padWithZeroes(month), day: padWithZeroes(day) }
    if (includeTime) {
      return { ...paddedDate, hour: padWithZeroes(hour), minute: padWithZeroes(minute) }
    }
    return paddedDate
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export function getDateTimeUTC(isoDate: string) {
  return DateTime.fromISO(isoDate, { zone: 'utc' })
}

export function getDateTimeInEuropeLondon(isoDate: string) {
  return getDateTimeUTC(isoDate).setZone(europeLondon)
}

export const dateHasError = (field: string | DateValidationError) => Boolean((field as DateValidationError).error)
