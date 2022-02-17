import { NextFunction, Request, Response } from 'express'
import { getAllFieldsHistory, getRecall } from '../../clients/manageRecallsApiClient'
import { changeHistoryFieldList } from './helpers/recallFieldList'
import { isString } from '../../utils/utils'

export const getAllFieldsChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { nomsNumber, recallId } = req.params
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
    const [fieldsHistoryResponse, recallResponse] = await Promise.allSettled([
      getAllFieldsHistory(recallId, token),
      getRecall(recallId, token),
    ])
    if (fieldsHistoryResponse.status === 'rejected') {
      throw fieldsHistoryResponse.reason
    }
    if (recallResponse.status === 'rejected') {
      throw recallResponse.reason
    }
    const uploadedDocuments = recallResponse.value.documents
    const changedFields = fieldsHistoryResponse.value
    res.locals.fieldsHistory = changeHistoryFieldList({ changedFields, uploadedDocuments })
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
