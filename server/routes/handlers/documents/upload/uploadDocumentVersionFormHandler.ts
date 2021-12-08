// add new version page
import { Request, Response } from 'express'
import { uploadStorageField } from './helpers/uploadStorage'
import { makeMetaDataForFile } from './helpers'
import { validateUploadedFileTypes } from './validations/validateDocuments'
import logger from '../../../../../logger'
import { errorMsgDocumentUpload } from '../../helpers/errorMessages'
import { makeErrorObject } from '../../helpers'
import { addRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'

export const uploadDocumentVersionFormHandler = async (req: Request, res: Response) => {
  uploadStorageField('document')(req, res, async uploadError => {
    try {
      if (uploadError) {
        throw uploadError
      }
      const { recallId } = req.params
      const { file, session, body } = req
      const {
        user: { token },
      } = res.locals
      if (!req.file) {
        session.errors = [
          makeErrorObject({
            id: 'document',
            text: errorMsgDocumentUpload.noFile,
          }),
        ]
      } else {
        const uploadedFileData = makeMetaDataForFile(file, body.categoryName)
        const { errors: invalidFileTypeErrors } = validateUploadedFileTypes([uploadedFileData], 'document')
        session.errors = invalidFileTypeErrors
        if (!session.errors) {
          const { category, fileContent, originalFileName } = uploadedFileData
          try {
            await addRecallDocument(recallId, { category, fileContent, fileName: originalFileName }, token)
          } catch (err) {
            if (err.data?.message === 'VirusFoundException') {
              session.errors = [
                makeErrorObject({
                  id: 'document',
                  text: errorMsgDocumentUpload.containsVirus(originalFileName),
                }),
              ]
            } else {
              session.errors = [
                makeErrorObject({
                  id: 'document',
                  text: errorMsgDocumentUpload.uploadFailed(originalFileName),
                }),
              ]
            }
          }
        }
      }
    } catch (e) {
      logger.error(e)
      req.session.errors = req.session.errors || [
        makeErrorObject({
          id: 'document',
          text: errorMsgDocumentUpload.saveError,
        }),
      ]
    } finally {
      const redirectUrl = req.session.errors
        ? `${req.originalUrl}&versionedCategoryName=${req.body.categoryName}`
        : `${res.locals.urlInfo.basePath}${res.locals.urlInfo.fromPage}`

      res.redirect(303, redirectUrl)
    }
  })
}
