import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject } from '../helpers'

export const issuesNeeds = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }

  const { contraband, contrabandDetail, vulnerabilityDiversity, vulnerabilityDiversityDetail, mappaLevel } = req.body

  if (
    !contraband ||
    !vulnerabilityDiversity ||
    (contraband === 'yes' && !contrabandDetail) ||
    (vulnerabilityDiversity === 'yes' && !vulnerabilityDiversityDetail) ||
    !mappaLevel
  ) {
    req.session.errors = []
    if (!vulnerabilityDiversity) {
      req.session.errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversity',
          text: 'Vulnerability issues or diversity needs',
        })
      )
    }
    if (!contraband) {
      req.session.errors.push(
        makeErrorObject({
          id: 'contraband',
          text: 'Contraband',
        })
      )
    }
    if (contraband === 'yes' && !contrabandDetail) {
      req.session.errors.push(
        makeErrorObject({
          id: 'contrabandDetail',
          text: 'Bring contraband to prison detail',
          values: { contraband, vulnerabilityDiversity, contrabandDetail, vulnerabilityDiversityDetail },
        })
      )
    }
    if (vulnerabilityDiversity === 'yes' && !vulnerabilityDiversityDetail) {
      req.session.errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversityDetail',
          text: 'Vulnerability issues or diversity needs detail',
          values: { contraband, vulnerabilityDiversity, contrabandDetail, vulnerabilityDiversityDetail },
        })
      )
    }
    if (!mappaLevel) {
      req.session.errors.push(
        makeErrorObject({
          id: 'mappaLevel',
          text: 'MAPPA level',
          values: { mappaLevel },
        })
      )
    }
  }
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    // If someone chooses Yes, and types a response, before choosing No, the response is still sent. This 'cleans' that.
    // Using blanks as server cannot handle nulls and will just not overwrite existing value
    const contrabandDetailCleaned = contraband === 'yes' ? contrabandDetail : ''
    const vulnerabilityDiversityDetailCleaned = vulnerabilityDiversity === 'yes' ? vulnerabilityDiversityDetail : ''

    const recall = await updateRecall(
      recallId,
      {
        contrabandDetail: contrabandDetailCleaned,
        vulnerabilityDiversityDetail: vulnerabilityDiversityDetailCleaned,
        mappaLevel,
      },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/probation-officer`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
