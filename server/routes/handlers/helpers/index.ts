import { isFuture, isValid } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
import { DatePartsParsed, NamedFormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import logger from '../../../../logger'

const getDaylightSavingOffset = (d: Date) => getTimezoneOffset('Europe/London', d) / (1000 * 60 * 60)

export const convertGmtDatePartsToUtc = ({ year, month, day, hour, minute }: ObjectMap<string>) => {
  try {
    const includeTime = isDefined(hour) && isDefined(day)
    const parts = [year, month, day, ...(includeTime ? [hour, minute] : [])]
    if (parts.find(part => !Number.isInteger(parseInt(part, 10)))) {
      return null
    }
    const [y, m, d, h, min] = parts.map(part => {
      return parseInt(part, 10)
    })
    let date
    if (includeTime) {
      date = new Date(Date.UTC(y, m - 1, d, h, min))
    } else {
      date = new Date(Date.UTC(y, m - 1, d))
    }
    date.setHours(date.getHours() - getDaylightSavingOffset(date))
    return !isValid(date) || isFuture(date) ? null : date
  } catch (err) {
    return null
  }
}

export const splitIsoDateToParts = (isoDate?: string): DatePartsParsed | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const date = new Date(isoDate)
    date.setHours(date.getHours() + getDaylightSavingOffset(date))
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
    }
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const makeErrorObject = ({
  id,
  text,
  values,
}: {
  id: string
  text: string
  values?: ObjectMap<string>
}): NamedFormError => ({
  name: id,
  text,
  href: `#${id}`,
  values,
})

export const isInvalid = (value: string): boolean => {
  return !value || (value && typeof value !== 'string')
}

export const getFormattedRecallLength = (recallLength?: RecallResponse.recallLength) => {
  switch (recallLength) {
    case RecallResponse.recallLength.FOURTEEN_DAYS:
      return '14 days'
    case RecallResponse.recallLength.TWENTY_EIGHT_DAYS:
      return '28 days'
    default:
      return ''
  }
}

export const isDefined = (val: unknown) => typeof val !== 'undefined'
