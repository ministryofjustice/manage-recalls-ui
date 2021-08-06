import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'

export const assessDecisionFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { agreeWithRecallRecommendation } = req.body
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  if (!agreeWithRecallRecommendation || !['YES', 'NO'].includes(agreeWithRecallRecommendation)) {
    req.session.errors = [
      makeErrorObject({
        id: 'agreeWithRecallRecommendation',
        text: 'Indicate if you agree or disagree with the recommended recall length',
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }
  try {
    const agreePayloadValue = agreeWithRecallRecommendation === 'YES'
    const recall = await updateRecall(
      recallId,
      { agreeWithRecallRecommendation: agreePayloadValue },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/assess-confirmation`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
