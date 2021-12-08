import { Request, Response } from 'express'
import { errorMsgDocumentUpload } from '../../../helpers/errorMessages'
import { getMetadataForUploadedFiles, saveUploadedFiles } from './index'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFileTypes } from '../validations/validateDocuments'
import { getPersonAndRecall } from '../../../helpers/fetch/getPersonAndRecall'
import { renderXhrResponse } from './uploadRenderXhrResponse'
import { makeErrorObject } from '../../../helpers'

export const uploadMultipleNewDocuments = async (req: Request, res: Response) => {
  const { files, session, body } = req
  const { recallId, nomsNumber } = req.params
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
      RecallDocument.category.UNCATEGORISED
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

  const { person, recall } = await getPersonAndRecall({ recallId, nomsNumber, token })
  // only render a response for XHR if there were no errors
  if (req.xhr) {
    const { existingDocIds } = body
    const parsed = JSON.parse(existingDocIds)
    return renderXhrResponse({ res, existingDocIds: parsed, recallId, nomsNumber, urlInfo, person, recall })
  }
}
