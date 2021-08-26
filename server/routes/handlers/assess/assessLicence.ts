import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

export const assessLicenceFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { licenceConditionsBreached, reasonsForRecall, reasonsForRecallOtherDetail } = req.body
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  const reasonsForRecallList = Array.isArray(reasonsForRecall) ? reasonsForRecall : [reasonsForRecall]
  const noOtherDetail =
    reasonsForRecallList?.includes(RecallResponse.reasonForRecall.OTHER) && !reasonsForRecallOtherDetail
  if (!licenceConditionsBreached || !reasonsForRecall || noOtherDetail) {
    req.session.errors = []
    if (!licenceConditionsBreached) {
      req.session.errors.push(
        makeErrorObject({
          id: 'licenceConditionsBreached',
          text: 'Licence conditions breached',
        })
      )
    }
    if (!reasonsForRecall) {
      req.session.errors.push(
        makeErrorObject({
          id: 'reasonsForRecall',
          text: 'Reasons for recall',
        })
      )
    }
    if (noOtherDetail) {
      req.session.errors.push(
        makeErrorObject({
          id: 'reasonsForRecallOtherDetail',
          text: 'Reasons for recall - provide detail on Other',
        })
      )
    }

    req.session.unsavedValues = {
      licenceConditionsBreached,
      reasonsForRecall: reasonsForRecallList,
      reasonsForRecallOtherDetail,
    }
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(
      recallId,
      { licenceConditionsBreached, reasonsForRecall: reasonsForRecallList, reasonsForRecallOtherDetail },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/assess-prison`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
