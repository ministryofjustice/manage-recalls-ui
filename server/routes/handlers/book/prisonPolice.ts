import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject } from '../helpers'

export const prisonPolice = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { localPoliceForce } = req.body
  if (!localPoliceForce) {
    req.session.errors = [
      makeErrorObject({
        id: 'localPoliceForce',
        text: 'Local police force',
        values: { localPoliceForce },
      }),
    ]
  }
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(recallId, { localPoliceForce }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/issues-needs`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
