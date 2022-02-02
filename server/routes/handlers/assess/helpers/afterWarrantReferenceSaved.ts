import { NextFunction, Request, Response } from 'express'
import logger from '../../../../../logger'
import { unassignUserFromRecall } from '../../../../clients/manageRecallsApiClient'

export const afterWarrantReferenceSaved = async (req: Request, res: Response, next: NextFunction) => {
  const { recallId } = req.params
  const { user } = res.locals
  try {
    await unassignUserFromRecall(recallId, user.uuid, user.token)
  } catch (e) {
    logger.error(`User ${user.uuid} could not be unassigned from recall ${recallId}`)
  }
  req.session.confirmationMessage = {
    text: 'Warrant reference number has been added.',
    link: {
      text: 'View',
      href: '#custody',
    },
    type: 'success',
  }
}
