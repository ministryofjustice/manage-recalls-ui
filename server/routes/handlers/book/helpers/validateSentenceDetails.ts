import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ValidationError, ReqValidatorReturn, ReqValidatorArgs } from '../../../../@types'
import { isBookingNumberValid } from '../../helpers/validations'
import { formatValidationErrorMessage } from '../../helpers/errorMessages'
import { isStringValidReferenceData } from '../../../../referenceData'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'
import { makeUrl, makeUrlToFromPage } from '../../helpers/makeUrl'

export const validateSentenceDetails = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let unsavedValues

  const {
    lastReleasePrison,
    lastReleasePrisonInput,
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
    sentencingCourtInput,
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
  // sentencingCourt is the value of the hidden select dropdown that's populated by the autocomplete
  // sentencingCourtInput is what the user typed into the autocomplete input. It might be a random string and not a valid court name, so needs validating
  const sentencingCourtInvalidInput = Boolean(
    sentencingCourtInput && !isStringValidReferenceData('courts', sentencingCourtInput)
  )
  // lastReleasePrison is the value of the hidden select dropdown that's populated by the autocomplete
  // lastReleasePrisonInput is what the user typed into the autocomplete input. It might be a random string and not a valid prison, so needs validating
  const lastReleasePrisonInvalidInput = Boolean(
    lastReleasePrisonInput && !isStringValidReferenceData('prisons', lastReleasePrisonInput)
  )

  if (
    dateHasError(sentenceDate) ||
    dateHasError(licenceExpiryDate) ||
    dateHasError(sentenceExpiryDate) ||
    dateHasError(lastReleaseDate) ||
    !lastReleasePrison ||
    lastReleasePrisonInvalidInput ||
    !sentencingCourt ||
    sentencingCourtInvalidInput ||
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
          text: formatValidationErrorMessage(sentenceDate as ValidationError, 'date of sentence'),
          values: sentenceDateParts,
        })
      )
    }
    if (dateHasError(licenceExpiryDate)) {
      errors.push(
        makeErrorObject({
          id: 'licenceExpiryDate',
          text: formatValidationErrorMessage(licenceExpiryDate as ValidationError, 'licence expiry date'),
          values: licenceExpiryDateParts,
        })
      )
    }
    if (dateHasError(sentenceExpiryDate)) {
      errors.push(
        makeErrorObject({
          id: 'sentenceExpiryDate',
          text: formatValidationErrorMessage(sentenceExpiryDate as ValidationError, 'sentence expiry date'),
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
    if (sentencingCourtInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a sentencing court'),
          values: sentencingCourtInput,
        })
      )
    } else if (!sentencingCourt) {
      errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a sentencing court'),
        })
      )
    }
    if (!indexOffence) {
      errors.push(
        makeErrorObject({
          id: 'indexOffence',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'an index offence'),
        })
      )
    }
    if (lastReleasePrisonInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a releasing prison'),
          values: lastReleasePrisonInput,
        })
      )
    } else if (!lastReleasePrison) {
      errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a releasing prison'),
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
          text: formatValidationErrorMessage(lastReleaseDate as ValidationError, 'latest release date'),
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
          text: formatValidationErrorMessage(conditionalReleaseDate as ValidationError, 'conditional release date'),
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
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('prison-police', urlInfo),
  }
}
