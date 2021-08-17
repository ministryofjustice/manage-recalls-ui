import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject, convertGmtDatePartsToUtc } from '../helpers'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const lastRelease = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
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
  } = req.body
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
  if (
    !lastReleaseDate ||
    !sentenceDate ||
    !licenceExpiryDate ||
    !sentenceExpiryDate ||
    !lastReleasePrison ||
    !sentencingCourt ||
    !indexOffence
  ) {
    req.session.errors = []
    if (!sentenceDate) {
      req.session.errors.push(
        makeErrorObject({
          id: 'sentenceDate',
          text: 'Date of sentence',
          values: { year: sentenceDateYear, month: sentenceDateMonth, day: sentenceDateDay },
        })
      )
    }
    if (!licenceExpiryDate) {
      req.session.errors.push(
        makeErrorObject({
          id: 'licenceExpiryDate',
          text: 'Licence expiry date',
          values: { year: licenceExpiryDateYear, month: licenceExpiryDateMonth, day: licenceExpiryDateDay },
        })
      )
    }
    if (!sentenceExpiryDate) {
      req.session.errors.push(
        makeErrorObject({
          id: 'sentenceExpiryDate',
          text: 'Sentence expiry date',
          values: { year: sentenceExpiryDateYear, month: sentenceExpiryDateMonth, day: sentenceExpiryDateDay },
        })
      )
    }
    if (!sentencingCourt) {
      req.session.errors.push(
        makeErrorObject({
          id: 'sentencingCourt',
          text: 'Sentencing court',
          values: { sentencingCourt },
        })
      )
    }
    if (!indexOffence) {
      req.session.errors.push(
        makeErrorObject({
          id: 'indexOffence',
          text: 'Index offence',
          values: { indexOffence },
        })
      )
    }
    if (!lastReleasePrison) {
      req.session.errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: 'Releasing prison',
          values: { lastReleasePrison },
        })
      )
    }
    if (!lastReleaseDate) {
      req.session.errors.push(
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
      req.session.errors = req.session.errors || []
      req.session.errors.push(
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
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    const payload: UpdateRecallRequest = {
      lastReleaseDate,
      sentenceDate,
      licenceExpiryDate,
      sentenceExpiryDate,
      lastReleasePrison,
      sentencingCourt,
      indexOffence,
    }
    if (conditionalReleaseDate) {
      payload.conditionalReleaseDate = conditionalReleaseDate
    }
    const recall = await updateRecall(recallId, payload, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/prison-police`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
