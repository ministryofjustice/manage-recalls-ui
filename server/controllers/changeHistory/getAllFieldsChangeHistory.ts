import { NextFunction, Request, Response } from 'express'
import { getAllFieldsHistory, getRecall } from '../../clients/manageRecallsApiClient'
import { changeHistoryFieldList } from './helpers/recallFieldList'

export const getAllFieldsChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { recallId } = req.params
  const {
    user: { token },
  } = res.locals
  try {
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
