import { DateTime, Settings } from 'luxon'
import {
  getCourtsResponse,
  getLocalDeliveryUnitsResponse,
  getPoliceForcesResponse,
  getPrisonsResponse,
  getMappaLevelsResponse,
  getReasonsForRecallResponse,
  getStopReasonsResponse,
} from '../mockApis/mockResponses'

Settings.throwOnInvalid = true

export const europeLondon = 'Europe/London'
const datePresentationFormat = 'd MMMM yyyy'
// const datePresentationNoYearFormat = 'd MMM'
// const timePresentationFormat = 'HH:mm'

export const isDefined = val => typeof val !== 'undefined'

export const splitIsoDateToParts = isoDate => {
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
    return undefined
  }
}

export const formatIsoDate = (isoDate, { dateOnly } = {}) => {
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

export function getDateTimeUTC(isoDate) {
  return DateTime.fromISO(isoDate, { zone: 'utc' })
}

export function isoDateToMillis(isoDate) {
  return getDateTimeUTC(isoDate).toMillis()
}

export function getDateTimeInEuropeLondon(isoDate) {
  return getDateTimeUTC(isoDate).setZone(europeLondon)
}

export const padWithZeroes = value => {
  if (!isDefined(value)) {
    return ''
  }
  const padded = value.toString()
  return padded.length < 2 ? `0${padded}` : padded
}

export const booleanToYesNo = bool => (bool ? 'Yes' : 'No')

export const exactMatchIgnoreWhitespace = str => new RegExp(`^\\s*${str}\\s*$`, 'g')

export const getIsoDateForMinutesAgo = minutes => {
  const now = DateTime.utc()
  return now.minus({ minutes }).toISO()
}

export const getIsoDateForToday = () => {
  return DateTime.utc().toISODate()
}

export const formatPersonName = ({ firstName = '', lastName = '' }) =>
  `${lastName.toUpperCase()} ${firstName.toUpperCase()}`

export const formatBookingNumber = bookingNumber => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')

export const getGeneratedDocFileName = ({ firstName, lastName, bookingNumber, category }) => {
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (category) {
    case 'RECALL_NOTIFICATION':
      return `IN CUSTODY RECALL ${details}.pdf`
    case 'DOSSIER':
      return `${details} RECALL DOSSIER.pdf`
    case 'LETTER_TO_PRISON':
      return `${details} LETTER TO PRISON.pdf`
    case 'REVOCATION_ORDER':
      return `${details} REVOCATION ORDER.pdf`
    case 'REASONS_FOR_RECALL':
      return `${details} REASONS FOR RECALL.pdf`
    default:
      return 'document.pdf'
  }
}

export const splitFullName = fullName => {
  const split = fullName.split(' ')
  return {
    firstName: split[0],
    lastName: split[1],
  }
}

const refData = {
  courts: getCourtsResponse,
  localDeliveryUnits: getLocalDeliveryUnitsResponse,
  policeForces: getPoliceForcesResponse,
  prisons: getPrisonsResponse,
  mappaLevels: getMappaLevelsResponse,
  reasonsForRecall: getReasonsForRecallResponse,
  stopReasons: getStopReasonsResponse,
}

export const getReferenceDataItemLabel = (refDataCategory, itemId) => {
  const list = refData[refDataCategory] || []
  return list ? list.find(item => item.id === itemId).name || undefined : undefined
}
