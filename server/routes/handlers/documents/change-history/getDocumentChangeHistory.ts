import { NextFunction, Request, Response } from 'express'
import { getDocumentCategoryHistory } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { findDocCategory } from '../upload/helpers'
import { RecallDocument } from '../../../../@types/manage-recalls-api'
import { isString, sortList } from '../../helpers'
import { getUploadedDocUrlPath } from '../download/helpers'

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
    const { label, labelLowerCase, name, standardFileName } = findDocCategory(category as RecallDocument.category)
    res.locals.documentHistory = {
      label,
      labelLowerCase,
      category: name,
      standardFileName,
    }
    const items = await getDocumentCategoryHistory(recallId, category as RecallDocument.category, token)
    res.locals.documentHistory.items = sortList(items, 'version', false).map((item: RecallDocument) => ({
      ...item,
      url: getUploadedDocUrlPath({ recallId, nomsNumber, documentId: item.documentId }),
    }))
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
