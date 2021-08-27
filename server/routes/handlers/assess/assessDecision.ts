import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'

export const assessDecisionFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { agreeWithRecall, agreeWithRecallDetailYes, agreeWithRecallDetailNo } = req.body
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  const isAgreeValueValid = ['YES', 'NO_STOP'].includes(agreeWithRecall)
  const isYes = agreeWithRecall === 'YES'
  const isNo = agreeWithRecall === 'NO_STOP'
  const yesDetailMissing = isYes && !agreeWithRecallDetailYes
  const noDetailMissing = isNo && !agreeWithRecallDetailNo
  if (!isAgreeValueValid || yesDetailMissing || noDetailMissing) {
    req.session.errors = []
    if (!isAgreeValueValid) {
      req.session.errors.push(
        makeErrorObject({
          id: 'agreeWithRecall',
          text: 'Do you agree with the recall recommendation?',
        })
      )
    }
    if (yesDetailMissing) {
      req.session.errors.push(
        makeErrorObject({
          id: 'agreeWithRecallDetailYes',
          text: 'Provide detail on your decision',
        })
      )
    }
    if (noDetailMissing) {
      req.session.errors.push(
        makeErrorObject({
          id: 'agreeWithRecallDetailNo',
          text: 'Provide detail on your decision',
        })
      )
    }
    req.session.unsavedValues = {
      agreeWithRecall,
      agreeWithRecallDetailYes,
      agreeWithRecallDetailNo,
    }
    return res.redirect(303, req.originalUrl)
  }
  try {
    const detail = isYes ? agreeWithRecallDetailYes : agreeWithRecallDetailNo
    const recall = await updateRecall(
      recallId,
      { agreeWithRecall, agreeWithRecallDetail: detail },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/assess-licence`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
