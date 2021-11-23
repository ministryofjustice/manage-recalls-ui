import { Request, Response } from 'express'
import { UrlInfo } from '../../../../@types'
import { deleteRecallDocument, getRecall } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { enableDeleteDocuments } from '../../helpers/documents'

export const deleteDocument = async (
  documentId: string,
  recallId: string,
  urlInfo: UrlInfo,
  token: string,
  req: Request,
  res: Response
) => {
  const recall = await getRecall(recallId, token)
  const document = recall.documents.find(doc => doc.documentId === documentId)
  if (!enableDeleteDocuments(recall.status, urlInfo)) {
    throw new Error(`Attempted to delete a document when fromPage was set to: ${urlInfo.fromPage}`)
  }
  await deleteRecallDocument(recallId, documentId, token)
  req.session.confirmationMessage = {
    text: `${document.fileName} has been deleted`,
    type: 'success',
  }
  return res.redirect(303, req.originalUrl)
}
