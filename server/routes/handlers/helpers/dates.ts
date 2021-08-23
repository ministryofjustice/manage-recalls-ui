import { getTimezoneOffset } from 'date-fns-tz'
import { isValid } from 'date-fns'
import { DatePartsParsed, ObjectMap } from '../../../@types'
import logger from '../../../../logger'
import { isDefined } from './index'

const getDaylightSavingOffset = (d: Date) => getTimezoneOffset('Europe/London', d) / (1000 * 60 * 60)

export const convertGmtDatePartsToUtc = ({ year, month, day, hour, minute }: ObjectMap<string>): string | undefined => {
  try {
    const includeTime = isDefined(hour) && isDefined(day)
    const parts = [year, month, day, ...(includeTime ? [hour, minute] : [])]
    if (parts.find(part => !Number.isInteger(parseInt(part, 10)))) {
      return undefined
    }
    const [y, m, d, h, min] = parts.map(part => {
      return parseInt(part, 10)
    })
    let date
    if (includeTime) {
      date = new Date(Date.UTC(y, m - 1, d, h, min))
      date.setHours(date.getHours() - getDaylightSavingOffset(date))
    } else {
      date = new Date(Date.UTC(y, m - 1, d))
    }
    if (!isValid(date)) {
      return undefined
    }
    return includeTime ? date.toISOString() : date.toISOString().substring(0, 10)
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
    const date = new Date(isoDate)
    date.setHours(date.getHours() + getDaylightSavingOffset(date))
    const parts = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    }
    if (includeTime) {
      return {
        ...parts,
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
      }
    }
    return parts
  } catch (err) {
    logger.error(err)
    return undefined
  }
}
