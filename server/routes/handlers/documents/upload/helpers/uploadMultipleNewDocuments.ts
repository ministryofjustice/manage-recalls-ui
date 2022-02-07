import { Request, Response } from 'express'
import { errorMsgDocumentUpload } from '../../../helpers/errorMessages'
import { getMetadataForUploadedFiles, saveUploadedFiles } from './index'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFileTypes } from '../validations/validateUploadedFileTypes'
import { renderXhrResponse } from './uploadRenderXhrResponse'
import { makeErrorObject } from '../../../helpers'
import { getRecall } from '../../../../../clients/manageRecallsApiClient'

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
    const uploadedFileData = getMetadataForUploadedFiles(
      files as Express.Multer.File[],
      RecallDocument.category.UNCATEGORISED,
      body.details
    )
    const { errors: invalidFileTypeErrors, valuesToSave: uploadsToSave } = validateUploadedFileTypes(
      uploadedFileData,
      'documents'
    )
    session.errors = invalidFileTypeErrors
    const failedUploads = await saveUploadedFiles({ uploadsToSave, recallId, token })
    if (failedUploads.length) {
      session.errors = [...(session.errors || []), ...failedUploads]
    }
  }
  if (session.errors) {
    if (req.xhr) {
      return res.json({ reload: true })
    }
    return res.redirect(303, req.originalUrl)
  }

  const recall = await getRecall(recallId, token)
  // only render a response for XHR if there were no errors
  if (req.xhr) {
    const { existingDocIds } = body
    const parsed = JSON.parse(existingDocIds)
    return renderXhrResponse({ res, existingDocIds: parsed, urlInfo, recall })
  }
}
