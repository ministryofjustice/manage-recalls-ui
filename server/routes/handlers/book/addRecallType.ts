import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject } from '../helpers'

export const addRecallType = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { recallLength } = req.body
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  if (isInvalid(recallLength)) {
    req.session.errors = [
      makeErrorObject({
        id: 'recallLength',
        text: 'Recommend a fixed recall length',
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(recallId, { recallLength }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/upload-documents`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
