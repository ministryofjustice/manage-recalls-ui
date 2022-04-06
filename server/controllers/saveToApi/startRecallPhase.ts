import { Request, Response } from 'express'
import { addPhaseStartTime, assignUserToRecall } from '../../clients/manageRecallsApiClient'
import { saveErrorWithDetails } from '../utils/errorMessages'
import { StartPhaseRequest } from '../../@types/manage-recalls-api'

export const startRecallPhase =
  ({
    nextPageUrlSuffix,
    phase,
    saveTiming = true,
  }: {
    nextPageUrlSuffix: string
    phase?: StartPhaseRequest.phase
    saveTiming?: boolean
  }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    try {
      await assignUserToRecall(recallId, user.uuid, user.token)
      if (saveTiming && phase) {
        await addPhaseStartTime({ recallId, valuesToSave: { phase }, user })
      }
      res.redirect(303, `${urlInfo.basePath}${nextPageUrlSuffix}`)
    } catch (err) {
      req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
      res.redirect(303, '/')
    }
  }
