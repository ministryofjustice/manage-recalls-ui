// add new version page
import { Request, Response } from 'express'
import { uploadStorageField } from './helpers/uploadStorage'
import { makeMetaDataForFile } from './helpers'
import { validateUploadedFileTypes } from './validations/validateDocuments'
import logger from '../../../../../logger'
import { errorMsgDocumentUpload, errorMsgProvideDetail } from '../../helpers/errorMessages'
import { makeErrorObject } from '../../helpers'
import { uploadRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'

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
        const uploadedFileData = makeMetaDataForFile(file, body.categoryName, body.details)
        const { errors: invalidFileTypeErrors } = validateUploadedFileTypes([uploadedFileData], 'document')
        session.errors = invalidFileTypeErrors
        if (!req.body.details) {
          session.errors = [
            ...(session.errors || []),
            makeErrorObject({
              id: 'details',
              text: errorMsgProvideDetail,
            }),
          ]
        }
        if (!session.errors) {
          const { category, fileContent, originalFileName, details } = uploadedFileData
          try {
            await uploadRecallDocument(recallId, { category, fileContent, fileName: originalFileName, details }, token)
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
