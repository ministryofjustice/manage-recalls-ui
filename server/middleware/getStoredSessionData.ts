import { NextFunction, Request, Response } from 'express'
import { transformErrorMessages } from '../controllers/utils/errorMessages'
import { isDefined } from '../utils/utils'

export const getStoredSessionData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { errors, unsavedValues, confirmationMessage } = req.session
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
    res.locals.unsavedValues = unsavedValues
    delete req.session.errors
    delete req.session.unsavedValues
  }
  if (confirmationMessage) {
    res.locals.confirmationMessage = confirmationMessage
    const requestPage = req.params.pageSlug || req.path
    if (!isDefined(confirmationMessage.pageToDisplayOn) || confirmationMessage.pageToDisplayOn === requestPage) {
      delete req.session.confirmationMessage
    }
  }
  next()
}
