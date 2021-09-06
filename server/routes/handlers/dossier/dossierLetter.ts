import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'

export const dossierLetterFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const {
    additionalLicenceConditions,
    additionalLicenceConditionsDetail,
    differentNomsNumber,
    differentNomsNumberDetail,
  } = req.body
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  const isLicenceValueValid = ['YES', 'NO'].includes(additionalLicenceConditions)
  const isNomsValueValid = ['YES', 'NO'].includes(differentNomsNumber)
  const isLicenceYes = additionalLicenceConditions === 'YES'
  const isNomsYes = differentNomsNumber === 'YES'
  const licenceDetailMissing = isLicenceYes && !additionalLicenceConditionsDetail
  const nomsDetailMissing = isNomsYes && !differentNomsNumberDetail

  // only use the detail fields if 'Yes' was checked; ignore them if 'No' was the last option checked
  const licenceDetailCleaned = isLicenceYes ? additionalLicenceConditionsDetail : ''
  const nomsDetailCleaned = isNomsYes ? differentNomsNumberDetail : ''

  if (!isLicenceValueValid || licenceDetailMissing || !isNomsValueValid || nomsDetailMissing) {
    req.session.errors = []
    if (!isLicenceValueValid) {
      req.session.errors.push(
        makeErrorObject({
          id: 'additionalLicenceConditions',
          text: 'Licence conditions',
        })
      )
    }
    if (licenceDetailMissing) {
      req.session.errors.push(
        makeErrorObject({
          id: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        })
      )
    }
    if (!isNomsValueValid) {
      req.session.errors.push(
        makeErrorObject({
          id: 'differentNomsNumber',
          text: 'Different NOMIS number',
        })
      )
    }
    if (nomsDetailMissing) {
      req.session.errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Provide the different NOMIS number',
        })
      )
    }
    req.session.unsavedValues = {
      additionalLicenceConditions,
      additionalLicenceConditionsDetail: licenceDetailCleaned,
      differentNomsNumber,
      differentNomsNumberDetail: nomsDetailCleaned,
    }
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(
      recallId,
      {
        additionalLicenceConditions: isLicenceYes,
        additionalLicenceConditionsDetail: licenceDetailCleaned,
        differentNomsNumber: isNomsYes,
        differentNomsNumberDetail: nomsDetailCleaned,
      },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/dossier-download`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
