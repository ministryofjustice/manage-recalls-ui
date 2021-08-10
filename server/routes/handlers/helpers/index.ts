import { isFuture, isValid, getYear, getMonth, getDate, getHours, getMinutes } from 'date-fns'
import { toDate, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { DatePartsParsed, NamedFormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import config from '../../../config'
import logger from '../../../../logger'

const { timeZone } = config

export const validateDate = ({ year, month, day, hour, minute }: ObjectMap<string>) => {
  try {
    const includeTime = isDefined(hour) && isDefined(day)
    const parts = [year, month, day, ...(includeTime ? [hour, minute] : [])]
    if (parts.find(part => !Number.isInteger(parseInt(part, 10)))) {
      return null
    }
    const dateStr = [0, 1, 2].map(idx => parts[idx].padStart(2, '0')).join('-')
    const timeStr = includeTime ? `${parts[3].padStart(2, '0')}:${parts[4].padStart(2, '0')}:00` : '00:00:00'
    const date = toDate(`${dateStr}T${timeStr}`, { timeZone })
    const utc = zonedTimeToUtc(date, timeZone)
    return !isValid(utc) || isFuture(utc) ? null : utc
  } catch (err) {
    return null
  }
}

export const splitIsoDateToParts = (isoDate?: string): DatePartsParsed | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const date = utcToZonedTime(isoDate, timeZone)
    return {
      year: getYear(date),
      month: getMonth(date) + 1,
      day: getDate(date),
      hour: getHours(date),
      minute: getMinutes(date),
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
