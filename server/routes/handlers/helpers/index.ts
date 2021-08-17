import { isValid } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
import { DatePartsParsed, FormError, NamedFormError, ObjectMap, RecallFormValues } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import logger from '../../../../logger'

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

export const getFormattedMappaLevel = (mappaLevel?: RecallResponse.mappaLevel) => {
  switch (mappaLevel) {
    case RecallResponse.mappaLevel.CONFIRMATION_REQUIRED:
      return 'Confirmation required'
    case RecallResponse.mappaLevel.LEVEL_1:
      return 'Level 1'
    case RecallResponse.mappaLevel.LEVEL_2:
      return 'Level 2'
    case RecallResponse.mappaLevel.LEVEL_3:
      return 'Level 3'
    case RecallResponse.mappaLevel.NA:
      return 'N/A'
    case RecallResponse.mappaLevel.NOT_KNOWN:
      return 'Not known'
    default:
      return ''
  }
}

export const isDefined = (val: unknown) => typeof val !== 'undefined'

export const getFormValues = ({
  errors = {},
  apiValues,
}: {
  errors: ObjectMap<FormError>
  apiValues: RecallResponse
}): RecallFormValues => {
  return {
    recallEmailReceivedDateTimeParts:
      errors.recallEmailReceivedDateTime?.values || splitIsoDateToParts(apiValues.recallEmailReceivedDateTime),
    lastReleasePrison: errors.lastReleasePrison?.values?.lastReleasePrison || apiValues.lastReleasePrison,
    lastReleaseDateParts: errors.lastReleaseDate?.values || splitIsoDateToParts(apiValues.lastReleaseDate),
    contrabandDetail: errors.contrabandDetail?.values?.contrabandDetail || apiValues.contrabandDetail,
    vulnerabilityDiversityDetail:
      errors.vulnerabilityDiversityDetail?.values?.vulnerabilityDiversityDetail ||
      apiValues.vulnerabilityDiversityDetail,
    mappaLevel: errors.mappaLevel?.values?.mappaLevel || apiValues.mappaLevel,
    sentenceDateParts: errors.sentenceDate?.values || splitIsoDateToParts(apiValues.sentenceDate),
    sentenceExpiryDateParts: errors.sentenceExpiryDate?.values || splitIsoDateToParts(apiValues.sentenceExpiryDate),
    licenceExpiryDateParts: errors.licenceExpiryDate?.values || splitIsoDateToParts(apiValues.licenceExpiryDate),
    sentenceLengthParts: errors.sentenceLength?.values || apiValues.sentenceLength,
    conditionalReleaseDateParts:
      errors.conditionalReleaseDate?.values || splitIsoDateToParts(apiValues.conditionalReleaseDate),
    sentencingCourt: errors.sentencingCourt?.values?.sentencingCourt || apiValues.sentencingCourt,
    indexOffence: errors.indexOffence?.values?.indexOffence || apiValues.indexOffence,
    localPoliceService: errors.localPoliceService?.values?.localPoliceService || apiValues.localPoliceService,
  } as RecallFormValues
}
