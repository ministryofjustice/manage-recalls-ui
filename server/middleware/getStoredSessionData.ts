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
    const requestPage = req.params.pageSlug || req.path
    const hasDisplayPage = isDefined(confirmationMessage.pageToDisplayOn)
    const isBetweenPage = confirmationMessage.pagesInBetween && confirmationMessage.pagesInBetween.includes(requestPage)
    // if EITHER:
    // 1. the confirmation message is intended to be shown on the requested page, whatever it is;
    // OR, 2. it's intended to be shown specifically on the current page
    // THEN set it on res.locals for display and delete from session
    if (!hasDisplayPage || confirmationMessage.pageToDisplayOn === requestPage) {
      res.locals.confirmationMessage = confirmationMessage
      delete req.session.confirmationMessage
      // if the message is intended to be shown on a specific page other than the current one, and we're not on an intermediary page
      // THEN don't set for display, and delete from session
    } else if (hasDisplayPage && !isBetweenPage) {
      delete req.session.confirmationMessage
    }
  }
  next()
}
