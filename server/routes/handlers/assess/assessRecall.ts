import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from '../book/documentTypes'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import logger from '../../../../logger'

export const getFormattedRecallLength = (recallLength?: RecallResponse.recallLength) => {
  switch (recallLength) {
    case RecallResponse.recallLength.FOURTEEN_DAYS:
      return '14 days'
    case RecallResponse.recallLength.TWENTY_EIGHT_DAYS:
      return '28 days'
    default:
      return ''
  }
}

export type ViewName = 'assessConfirmation' | 'assessDecision' | 'assessRecall'

export const assessRecallView =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    const [person, recall] = await Promise.all([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
    ])
    recall.documents = recall.documents.map(doc => ({
      ...doc,
      ...(documentTypes.find(d => d.name === doc.category) || {}),
    }))
    res.locals.recall = { ...recall, recallLengthFormatted: getFormattedRecallLength(recall.recallLength) }
    res.locals.person = person
    res.render(`pages/${viewName}`)
  }

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
      {
        name: 'agreeWithRecallRecommendation',
        text: 'Indicate if you agree or disagree with the recommended recall length',
        href: '#agreeWithRecallRecommendation',
      },
    ]
    return res.redirect(303, `/persons/${nomsNumber}/recalls/${recallId}/assess-decision`)
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
