import { convertGmtDatePartsToUtc, makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ObjectMap } from '../../../../@types'

export const validateSentenceDetails = (requestBody: ObjectMap<string>) => {
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
  } = requestBody
  let conditionalReleaseDate
  let sentenceLength
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
  if (
    !lastReleaseDate ||
    !sentenceDate ||
    !licenceExpiryDate ||
    !sentenceExpiryDate ||
    !lastReleasePrison ||
    !sentencingCourt ||
    !indexOffence
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
    if (!sentencingCourt) {
      errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: 'Sentencing court',
          values: { sentencingCourt },
        })
      )
    }
    if (!indexOffence) {
      errors.push(
        makeErrorObject({
          id: 'indexOffence',
          text: 'Index offence',
          values: { indexOffence },
        })
      )
    }
    if (!lastReleasePrison) {
      errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: 'Releasing prison',
          values: { lastReleasePrison },
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

  const years = parseInt(sentenceLengthYears, 10) || undefined
  const months = parseInt(sentenceLengthMonths, 10) || undefined
  const days = parseInt(sentenceLengthDays, 10) || undefined
  if (!(years || months || days)) {
    errors = errors || []
    errors.push(
      makeErrorObject({
        id: 'sentenceLength',
        text: 'Length of sentence',
        values: { years: sentenceLengthYears, months: sentenceLengthMonths, days: sentenceLengthDays },
      })
    )
  } else {
    sentenceLength = {
      years,
      months,
      days,
    }
  }
  const validValues: UpdateRecallRequest = {
    lastReleaseDate,
    sentenceDate,
    licenceExpiryDate,
    sentenceExpiryDate,
    lastReleasePrison,
    sentencingCourt,
    indexOffence,
    sentenceLength,
  }
  if (conditionalReleaseDate) {
    validValues.conditionalReleaseDate = conditionalReleaseDate
  }
  return { errors, validValues }
}
