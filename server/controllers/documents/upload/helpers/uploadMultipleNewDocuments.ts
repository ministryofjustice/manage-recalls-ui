import { Request, Response } from 'express'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { getMetadataForUploadedFiles, saveUploadedFiles } from './index'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFiles } from '../validators/validateUploadedFiles'
import { renderXhrResponse } from './uploadRenderXhrResponse'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { sendFileSizeMetric } from './sendFileSizeMetric'

export const uploadMultipleNewDocuments = async (req: Request, res: Response) => {
  const { files, session, body } = req
  const { recallId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals
  if (!files.length) {
    session.errors = [
      makeErrorObject({
        id: 'documents',
        text: errorMsgDocumentUpload.noFile,
      }),
    ]
  } else {
    ;(files as Express.Multer.File[]).forEach(file => sendFileSizeMetric(file))
    const uploadedFileData = getMetadataForUploadedFiles(
      files as Express.Multer.File[],
      RecallDocument.category.UNCATEGORISED,
      body.details
    )
    const { errors: invalidFileTypeErrors, valuesToSave: uploadsToSave } = validateUploadedFiles({
      files: files as Express.Multer.File[],
      uploadedFileData,
      fileUploadInputName: 'documents',
    })
    session.errors = invalidFileTypeErrors
    const failedUploads = await saveUploadedFiles({ uploadsToSave, recallId, token })
    if (failedUploads.length) {
      session.errors = [...(session.errors || []), ...failedUploads]
    }
  }
  if (session.errors) {
    throw new Error('uploadMultipleNewDocuments')
  }

  // only render a response for XHR if there were no errors
  if (req.xhr) {
    const recall = await getRecall(recallId, token)
    const { existingDocIds } = body
    const parsed = JSON.parse(existingDocIds)
    return renderXhrResponse({ res, existingDocIds: parsed, urlInfo, recall })
  }
  return res.redirect(303, req.originalUrl)
}
