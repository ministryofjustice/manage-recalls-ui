// add new version page
import { Request, Response } from 'express'
import { uploadStorageField } from './helpers/uploadStorage'
import { makeMetaDataForFile, uploadedDocCategoriesList } from './helpers'
import { validateDocumentVersion } from './validations/validateDocumentVersion'
import logger from '../../../../../logger'
import { errorMsgDocumentUpload } from '../../helpers/errorMessages'
import { makeErrorObject } from '../../helpers'
import { uploadRecallDocument } from '../../../../clients/manageRecallsApiClient'

export const uploadDocumentVersionFormHandler = async (req: Request, res: Response) => {
  uploadStorageField('document')(req, res, async uploadError => {
    try {
      const uploadFailed = Boolean(uploadError)
      const { recallId } = req.params
      const { file, session, body } = req
      const {
        user: { token },
      } = res.locals
      const invalidCategory = !uploadedDocCategoriesList().find(cat => cat.name === body.categoryName)
      if (invalidCategory) {
        throw new Error('Invalid category')
      }
      const uploadedFileData = file && makeMetaDataForFile(file, body.categoryName, body.details)
      const { errors } = validateDocumentVersion(uploadedFileData, body, uploadFailed)
      session.errors = errors
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
