import { Request, Response } from 'express'
import { createRecall as createRecallApi, getPrisonerByNomsNumber } from '../../clients/manageRecallsApiClient'

export const createRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber } = req.params
  if (!nomsNumber) {
    res.sendStatus(400)
    return
  }
  const { user } = res.locals
  const { firstName, lastName, middleNames, croNumber, dateOfBirth } = await getPrisonerByNomsNumber(
    nomsNumber,
    user.token
  )
  const { recallId } = await createRecallApi(
    { firstName, lastName, middleNames, nomsNumber, croNumber, dateOfBirth },
    user.token
  )
  const nextPageSuffix = middleNames ? 'licence-name' : 'pre-cons-name'
  res.redirect(303, `/recalls/${recallId}/${nextPageSuffix}`)
}
