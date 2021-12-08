import { Request, Response } from 'express'
import { deleteRecallDocument, getRecall } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { enableDeleteDocuments } from '../upload/helpers'

export const deleteDocument = async (req: Request, res: Response) => {
  const { recallId } = req.params
  const documentId = req.body.delete
  const {
    user: { token },
    urlInfo,
  } = res.locals
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
