import { convertGmtDatePartsToUtc, makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validateSentenceDetails = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; validValues: UpdateRecallRequest } => {
  let errors
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
  const lastReleaseDate = convertGmtDatePartsToUtc({
    year: lastReleaseDateYear,
    month: lastReleaseDateMonth,
    day: lastReleaseDateDay,
  })
  const sentenceDate = convertGmtDatePartsToUtc({
    year: sentenceDateYear,
    month: sentenceDateMonth,
    day: sentenceDateDay,
  })
  const licenceExpiryDate = convertGmtDatePartsToUtc({
    year: licenceExpiryDateYear,
    month: licenceExpiryDateMonth,
    day: licenceExpiryDateDay,
  })
  const sentenceExpiryDate = convertGmtDatePartsToUtc({
    year: sentenceExpiryDateYear,
    month: sentenceExpiryDateMonth,
    day: sentenceExpiryDateDay,
  })

  const sentenceLengthYearsParsed = parseInt(sentenceLengthYears, 10) || undefined
  const sentenceLengthMonthsParsed = parseInt(sentenceLengthMonths, 10) || undefined
  const sentenceLengthDaysParsed = parseInt(sentenceLengthDays, 10) || undefined
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
          values: { year: sentenceDateYear, month: sentenceDateMonth, day: sentenceDateDay },
        })
      )
    }
    if (!licenceExpiryDate) {
      errors.push(
        makeErrorObject({
          id: 'licenceExpiryDate',
          text: 'Licence expiry date',
          values: { year: licenceExpiryDateYear, month: licenceExpiryDateMonth, day: licenceExpiryDateDay },
        })
      )
    }
    if (!sentenceExpiryDate) {
      errors.push(
        makeErrorObject({
          id: 'sentenceExpiryDate',
          text: 'Sentence expiry date',
          values: { year: sentenceExpiryDateYear, month: sentenceExpiryDateMonth, day: sentenceExpiryDateDay },
        })
      )
    }
    if (!sentenceLengthEntered) {
      errors.push(
        makeErrorObject({
          id: 'sentenceLength',
          text: 'Length of sentence',
          values: { years: sentenceLengthYears, months: sentenceLengthMonths, days: sentenceLengthDays },
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
          values: { year: lastReleaseDateYear, month: lastReleaseDateMonth, day: lastReleaseDateDay },
        })
      )
    }
  }
  if (conditionalReleaseDateYear || conditionalReleaseDateMonth || conditionalReleaseDateDay) {
    conditionalReleaseDate = convertGmtDatePartsToUtc({
      year: conditionalReleaseDateYear,
      month: conditionalReleaseDateMonth,
      day: conditionalReleaseDateDay,
    })
    if (!conditionalReleaseDate) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'conditionalReleaseDate',
          text: 'Conditional release date',
          values: {
            year: conditionalReleaseDateYear,
            month: conditionalReleaseDateMonth,
            day: conditionalReleaseDateDay,
          },
        })
      )
    }
  }

  const validValues: UpdateRecallRequest = {
    lastReleaseDate,
    sentenceDate,
    licenceExpiryDate,
    sentenceExpiryDate,
    lastReleasePrison: lastReleasePrison || undefined,
    sentencingCourt: sentencingCourt || undefined,
    indexOffence: indexOffence || undefined,
    conditionalReleaseDate,
    bookingNumber: bookingNumber || undefined,
  }
  if (sentenceLengthEntered) {
    validValues.sentenceLength = {
      years: sentenceLengthYearsParsed,
      months: sentenceLengthMonthsParsed,
      days: sentenceLengthDaysParsed,
    }
  }
  return { errors, validValues }
}
