import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc } from '../../helpers/dates'

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
  const lastReleaseDate = convertGmtDatePartsToUtc(lastReleaseDateParts, { dateMustBeInPast: true })
  const sentenceDate = convertGmtDatePartsToUtc(sentenceDateParts, { dateMustBeInPast: true })
  const licenceExpiryDate = convertGmtDatePartsToUtc(licenceExpiryDateParts, { dateMustBeInFuture: true })
  const sentenceExpiryDate = convertGmtDatePartsToUtc(sentenceExpiryDateParts, { dateMustBeInFuture: true })

  const sentenceLengthYearsParsed = parseInt(sentenceLengthYears, 10) || undefined
  const sentenceLengthMonthsParsed = parseInt(sentenceLengthMonths, 10) || undefined
  const sentenceLengthDaysParsed = parseInt(sentenceLengthDays, 10) || undefined
  const sentenceLengthParts = { years: sentenceLengthYears, months: sentenceLengthMonths, days: sentenceLengthDays }
  const sentenceLengthEntered = Boolean(
    sentenceLengthYearsParsed || sentenceLengthMonthsParsed || sentenceLengthDaysParsed
  )
  if (
    !lastReleaseDate ||
    !sentenceDate ||
    !licenceExpiryDate ||
    !sentenceExpiryDate ||
    !lastReleasePrison ||
    !sentencingCourt ||
    !indexOffence ||
    !bookingNumber ||
    !sentenceLengthEntered
  ) {
    errors = []
    if (!sentenceDate) {
      errors.push(
        makeErrorObject({
          id: 'sentenceDate',
          text: 'Date of sentence',
          values: sentenceDateParts,
        })
      )
    }
    if (!licenceExpiryDate) {
      errors.push(
        makeErrorObject({
          id: 'licenceExpiryDate',
          text: 'Licence expiry date',
          values: licenceExpiryDateParts,
        })
      )
    }
    if (!sentenceExpiryDate) {
      errors.push(
        makeErrorObject({
          id: 'sentenceExpiryDate',
          text: 'Sentence expiry date',
          values: sentenceExpiryDateParts,
        })
      )
    }
    if (!sentenceLengthEntered) {
      errors.push(
        makeErrorObject({
          id: 'sentenceLength',
          text: 'Length of sentence',
          values: sentenceLengthParts,
        })
      )
    }
    if (!sentencingCourt) {
      errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: 'Sentencing court',
        })
      )
    }
    if (!indexOffence) {
      errors.push(
        makeErrorObject({
          id: 'indexOffence',
          text: 'Index offence',
        })
      )
    }
    if (!lastReleasePrison) {
      errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: 'Releasing prison',
        })
      )
    }
    if (!bookingNumber) {
      errors.push(
        makeErrorObject({
          id: 'bookingNumber',
          text: 'Booking number',
        })
      )
    }
    if (!lastReleaseDate) {
      errors.push(
        makeErrorObject({
          id: 'lastReleaseDate',
          text: 'Latest release date',
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
    if (!conditionalReleaseDate) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'conditionalReleaseDate',
          text: 'Conditional release date',
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
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
