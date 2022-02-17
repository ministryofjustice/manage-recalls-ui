import { Request, Response } from 'express'
import { addReturnToCustodyDates } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { validateReturnToCustodyDates } from './validators/validateReturnToCustodyDates'

export const returnToCustodyDatesFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  const { user, urlInfo } = res.locals
  const { errors, unsavedValues, valuesToSave, redirectToPage } = validateReturnToCustodyDates({
    requestBody: req.body,
    urlInfo,
    user,
  })
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }
  try {
    await addReturnToCustodyDates(recallId, valuesToSave, user.token)
    req.session.confirmationMessage = {
      text: 'Recall updated and moved to the to do list',
      type: 'success',
    }
    res.redirect(303, redirectToPage)
  } catch (err) {
    logger.error(err)
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ]
    res.redirect(303, req.originalUrl)
  }
}
