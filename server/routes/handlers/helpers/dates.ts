import { DateTime, Settings } from 'luxon'
import { DatePartsParsed, ObjectMap } from '../../../@types'
import logger from '../../../../logger'
import { isDefined } from './index'

const timeZone = 'Europe/London'
Settings.throwOnInvalid = true

interface Options {
  dateMustBeInPast?: boolean
  dateMustBeInFuture?: boolean
}

export const convertGmtDatePartsToUtc = (
  { year, month, day, hour, minute }: ObjectMap<string>,
  options?: Options
): string | undefined => {
  try {
    const includeTime = isDefined(hour) && isDefined(day)
    const parts = [year, month, day, ...(includeTime ? [hour, minute] : [])]
    const hasInvalidPart = parts.some(part => !Number.isInteger(parseInt(part, 10)))
    if (hasInvalidPart) {
      return undefined
    }
    const [y, m, d, h, min] = parts.map(part => {
      return parseInt(part, 10)
    })
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
        return undefined
      }
      if (options.dateMustBeInFuture === true && now > date) {
        return undefined
      }
    }
    if (includeTime) {
      return date.setZone('utc').toString()
    }
    return date.toISODate()
  } catch (err) {
    return undefined
  }
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
