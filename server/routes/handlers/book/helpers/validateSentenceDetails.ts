import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'
import { isBookingNumberValid } from '../../helpers/validations'

export const validateSentenceDetails = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let valuesToSave
  let unsavedValues

  const {
    lastReleasePrison,
    lastReleaseDateYear,
    lastReleaseDateMonth,
    lastReleaseDateDay,
    sentenceDateYear,
    sentenceDateMonth,
    sentenceDateDay,
    licenceExpiryDateYear,
    licenceExpiryDateMonth,
    licenceExpiryDateDay,
    sentenceExpiryDateYear,
    sentenceExpiryDateMonth,
    sentenceExpiryDateDay,
    sentencingCourt,
    indexOffence,
    conditionalReleaseDateYear,
    conditionalReleaseDateMonth,
    conditionalReleaseDateDay,
    sentenceLengthYears,
    sentenceLengthMonths,
    sentenceLengthDays,
    bookingNumber,
  } = requestBody
  let conditionalReleaseDate
  const lastReleaseDateParts = {
    year: lastReleaseDateYear,
    month: lastReleaseDateMonth,
    day: lastReleaseDateDay,
  }
  const sentenceDateParts = {
    year: sentenceDateYear,
    month: sentenceDateMonth,
    day: sentenceDateDay,
  }
  const licenceExpiryDateParts = {
    year: licenceExpiryDateYear,
    month: licenceExpiryDateMonth,
    day: licenceExpiryDateDay,
  }
  const sentenceExpiryDateParts = {
    year: sentenceExpiryDateYear,
    month: sentenceExpiryDateMonth,
    day: sentenceExpiryDateDay,
  }
  const sentenceDate = convertGmtDatePartsToUtc(sentenceDateParts, { dateMustBeInPast: true })
  const licenceExpiryDate = convertGmtDatePartsToUtc(licenceExpiryDateParts, { dateMustBeInFuture: true })
  const sentenceExpiryDate = convertGmtDatePartsToUtc(sentenceExpiryDateParts, { dateMustBeInFuture: true })
  const lastReleaseDate = convertGmtDatePartsToUtc(lastReleaseDateParts, { dateMustBeInPast: true })
  const sentenceLengthYearsParsed = parseInt(sentenceLengthYears, 10) || undefined
  const sentenceLengthMonthsParsed = parseInt(sentenceLengthMonths, 10) || undefined
  const sentenceLengthDaysParsed = parseInt(sentenceLengthDays, 10) || undefined
  const sentenceLengthParts = { years: sentenceLengthYears, months: sentenceLengthMonths, days: sentenceLengthDays }
  const sentenceLengthEntered = Boolean(
    sentenceLengthYearsParsed || sentenceLengthMonthsParsed || sentenceLengthDaysParsed
  )
  const bookingNumberValid = isBookingNumberValid(bookingNumber)
  if (
    dateHasError(sentenceDate) ||
    dateHasError(licenceExpiryDate) ||
    dateHasError(sentenceExpiryDate) ||
    dateHasError(lastReleaseDate) ||
    !lastReleasePrison ||
    !sentencingCourt ||
    !indexOffence ||
    !bookingNumber ||
    !bookingNumberValid ||
    !sentenceLengthEntered
  ) {
    errors = []
    if (dateHasError(sentenceDate)) {
      errors.push(
        makeErrorObject({
          id: 'sentenceDate',
          text: 'Enter the date of sentence',
          values: sentenceDateParts,
        })
      )
    }
    if (dateHasError(licenceExpiryDate)) {
      errors.push(
        makeErrorObject({
          id: 'licenceExpiryDate',
          text: 'Enter a licence expiry date',
          values: licenceExpiryDateParts,
        })
      )
    }
    if (dateHasError(sentenceExpiryDate)) {
      errors.push(
        makeErrorObject({
          id: 'sentenceExpiryDate',
          text: 'Enter a sentence expiry date',
          values: sentenceExpiryDateParts,
        })
      )
    }
    if (!sentenceLengthEntered) {
      errors.push(
        makeErrorObject({
          id: 'sentenceLength',
          text: 'Enter the length of sentence',
          values: sentenceLengthParts,
        })
      )
    }
    if (!sentencingCourt) {
      errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: 'Select a sentencing court',
        })
      )
    }
    if (!indexOffence) {
      errors.push(
        makeErrorObject({
          id: 'indexOffence',
          text: 'Select an index offence',
        })
      )
    }
    if (!lastReleasePrison) {
      errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: 'Select a releasing prison',
        })
      )
    }
    if (!bookingNumber) {
      errors.push(
        makeErrorObject({
          id: 'bookingNumber',
          text: 'Enter a booking number',
        })
      )
    }
    if (bookingNumber && !bookingNumberValid) {
      errors.push(
        makeErrorObject({
          id: 'bookingNumber',
          values: bookingNumber,
          text: 'Enter a booking number in the correct format, like 12345C, A12347 or AB1234',
        })
      )
    }
    if (dateHasError(lastReleaseDate)) {
      errors.push(
        makeErrorObject({
          id: 'lastReleaseDate',
          text: 'Enter a latest release date',
          values: lastReleaseDateParts,
        })
      )
    }
  }
  const conditionalReleaseDateParts = {
    year: conditionalReleaseDateYear,
    month: conditionalReleaseDateMonth,
    day: conditionalReleaseDateDay,
  }
  if (conditionalReleaseDateYear || conditionalReleaseDateMonth || conditionalReleaseDateDay) {
    conditionalReleaseDate = convertGmtDatePartsToUtc(conditionalReleaseDateParts)
    if (dateHasError(conditionalReleaseDate)) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'conditionalReleaseDate',
          text: 'Enter a conditional release date',
          values: conditionalReleaseDateParts,
        })
      )
    }
  }

  if (errors) {
    unsavedValues = {
      lastReleaseDateParts,
      licenceExpiryDateParts,
      sentenceExpiryDateParts,
      conditionalReleaseDateParts,
      lastReleasePrison,
      sentenceDateParts,
      sentencingCourt,
      indexOffence,
      sentenceLengthParts,
      bookingNumber,
    }
  } else {
    valuesToSave = {
      lastReleaseDate,
      sentenceDate,
      licenceExpiryDate,
      sentenceExpiryDate,
      lastReleasePrison: lastReleasePrison || undefined,
      sentencingCourt: sentencingCourt || undefined,
      indexOffence: indexOffence || undefined,
      conditionalReleaseDate,
      bookingNumber: bookingNumber || undefined,
      sentenceLength: sentenceLengthEntered
        ? {
            years: sentenceLengthYearsParsed,
            months: sentenceLengthMonthsParsed,
            days: sentenceLengthDaysParsed,
          }
        : undefined,
    } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues }
}
