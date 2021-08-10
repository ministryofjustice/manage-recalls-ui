import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject } from '../helpers'

export const prisonPolice = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { localPoliceService } = req.body
  if (!localPoliceService) {
    req.session.errors = [
      makeErrorObject({
        id: 'localPoliceService',
        text: 'Local police station',
        values: { localPoliceService },
      }),
    ]
  }
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(recallId, { localPoliceService }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/upload-documents`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
