import { NextFunction, Request, Response } from 'express'
import { getDocumentCategoryHistory, getRecall } from '../../clients/manageRecallsApiClient'
import { findDocCategory } from '../documents/upload/helpers'
import { RecallDocument } from '../../@types/manage-recalls-api/models/RecallDocument'
import { generated, uploaded } from './helpers'
import { sortList } from '../utils/lists'
import { isString } from '../../utils/utils'

export const getDocumentChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { recallId } = req.params
  const { category } = req.query
  const {
    user: { token },
  } = res.locals
  try {
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
    const [historyResponse, recallResponse] = await Promise.allSettled([
      getDocumentCategoryHistory(recallId, name, token),
      getRecall(recallId, token),
    ])
    if (historyResponse.status === 'rejected') {
      throw historyResponse.reason
    }
    if (recallResponse.status === 'rejected') {
      throw recallResponse.reason
    }
    const historyItems = historyResponse.value
    const recall = recallResponse.value
    const sortedHistory = sortList<RecallDocument>(historyItems, 'version', false)
    res.locals.documentHistory.items =
      type === 'generated'
        ? generated({
            sortedHistory,
            recall,
          })
        : uploaded({
            sortedHistory,
            recall,
            category: name,
            standardFileName,
          })
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
