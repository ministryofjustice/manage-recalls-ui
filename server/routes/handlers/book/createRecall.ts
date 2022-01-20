import { Request, Response } from 'express'
import { createRecall as createRecallApi } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from '../helpers/personCache'

export const createRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber } = req.params
  if (!nomsNumber) {
    res.sendStatus(400)
    return
  }
  const { user } = res.locals
  const { firstName, lastName, middleNames } = await getPerson(nomsNumber, user.token)
  const { recallId } = await createRecallApi({ firstName, lastName, middleNames, nomsNumber }, user.token)
  const nextPageSuffix = middleNames ? 'licence-name' : 'pre-cons-name'
  res.redirect(303, `/persons/${nomsNumber}/recalls/${recallId}/${nextPageSuffix}`)
}
