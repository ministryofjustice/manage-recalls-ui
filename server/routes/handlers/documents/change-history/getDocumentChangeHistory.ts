import { NextFunction, Request, Response } from 'express'
import { getDocumentCategoryHistory } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { findDocCategory } from '../upload/helpers'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { isString, sortList } from '../../helpers'
import { getPersonAndRecall } from '../../helpers/fetch/getPersonAndRecall'
import { generated, uploaded } from './helpers'

export const getDocumentChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { nomsNumber, recallId } = req.params
  const { category } = req.query
  const {
    user: { token },
  } = res.locals
  try {
    if (!isString(recallId)) {
      throw new Error('Invalid recallId')
    }
    if (!isString(nomsNumber)) {
      throw new Error('Invalid nomsNumber')
    }
    if (!isString(category) || !findDocCategory(category as RecallDocument.category)) {
      throw new Error('Invalid category')
    }
    const { label, labelLowerCase, name, standardFileName, type } = findDocCategory(category as RecallDocument.category)
    res.locals.documentHistory = {
      label,
      labelLowerCase,
      category: name,
      type,
    }
    const [historyResponse, personAndRecallResponse] = await Promise.allSettled([
      getDocumentCategoryHistory(recallId, name, token),
      getPersonAndRecall({ recallId, nomsNumber, token }),
    ])
    if (historyResponse.status === 'rejected') {
      throw historyResponse.reason
    }
    if (personAndRecallResponse.status === 'rejected') {
      throw personAndRecallResponse.reason
    }
    const historyItems = historyResponse.value
    const personAndRecall = personAndRecallResponse.value
    const sortedHistory = sortList<RecallDocument>(historyItems, 'version', false)
    res.locals.documentHistory.items =
      type === 'generated'
        ? generated({
            sortedHistory,
            personAndRecall,
          })
        : uploaded({
            sortedHistory,
            recall: personAndRecall.recall,
            category: name,
            standardFileName,
          })
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
