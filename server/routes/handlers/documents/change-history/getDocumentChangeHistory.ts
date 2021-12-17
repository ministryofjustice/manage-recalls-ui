import { NextFunction, Request, Response } from 'express'
import { getDocumentCategoryHistory } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { findDocCategory } from '../upload/helpers'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { isString, sortList } from '../../helpers'
import { getPersonAndRecall } from '../../helpers/fetch/getPersonAndRecall'
import { generatedDocMetaData, documentDownloadUrl } from '../download/helpers'

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
    const items = await getDocumentCategoryHistory(recallId, category as RecallDocument.category, token)
    const personAndRecall = type === 'generated' ? await getPersonAndRecall({ recallId, nomsNumber, token }) : undefined
    res.locals.documentHistory.items = sortList(items, 'version', false).map((document: RecallDocument) =>
      type === 'generated'
        ? generatedDocMetaData({
            recallId,
            nomsNumber,
            document,
            firstName: personAndRecall?.person?.firstName,
            lastName: personAndRecall?.person?.lastName,
            bookingNumber: personAndRecall?.recall?.bookingNumber,
          })
        : {
            ...document,
            fileName: standardFileName || document.fileName,
            url: documentDownloadUrl({ recallId, nomsNumber, documentId: document.documentId }),
          }
    )
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
