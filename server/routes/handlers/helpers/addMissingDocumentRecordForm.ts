import { Request, Response } from 'express'
import { addMissingDocumentRecord } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from './uploadStorage'
import { validateMissingDocuments } from './validateMissingDocuments'
import { makeErrorObject } from './index'
import { allowedEmailFileExtensions } from './allowedUploadExtensions'
import { errorMsgEmailUpload } from './errorMessages'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api'

export const addMissingDocumentRecordForm = async (req: Request, res: Response): Promise<void> => {
  const emailFieldName = 'missingDocumentsEmailFileName'
  const processUpload = uploadStorageField(emailFieldName)
  const { recallId } = req.params
  const { user, urlInfo } = res.locals
  let saveError = [
    makeErrorObject({
      id: emailFieldName,
      text: errorMsgEmailUpload.uploadFailed,
    }),
  ]
  let saveToApiSuccessful = false
  processUpload(req, res, async err => {
    try {
      const uploadFailed = Boolean(err)
      const { file } = req
      const emailFileSelected = Boolean(file)
      const invalidFileFormat = emailFileSelected
        ? !allowedEmailFileExtensions.some(ext => file.originalname.endsWith(ext.extension))
        : false
      const { errors, valuesToSave, unsavedValues } = validateMissingDocuments({
        requestBody: req.body,
        emailFileSelected,
        uploadFailed,
        invalidFileFormat,
      })
      const uploadHasErrors = errors && errors.find(uploadError => uploadError.name === emailFieldName)
      const shouldSaveToApi = !uploadHasErrors && emailFileSelected && !uploadFailed
      if (shouldSaveToApi) {
        try {
          const missingDocumentCategories = [] as ApiRecallDocument.category[]
          const response = await addMissingDocumentRecord(
            {
              categories: missingDocumentCategories,
              recallId,
              detail: valuesToSave.missingDocumentsDetail,
              emailFileName: file.originalname,
              emailFileContent: file.buffer.toString('base64'),
            },
            user.token
          )
          if (response.status === 201) {
            saveToApiSuccessful = true
          }
        } catch (e) {
          saveToApiSuccessful = false
          if (e.data?.message === 'VirusFoundException') {
            saveError = [
              makeErrorObject({
                id: emailFieldName,
                text: errorMsgEmailUpload.containsVirus(file.originalname),
              }),
            ]
          }
        }
      }
      if (errors || (shouldSaveToApi && !saveToApiSuccessful)) {
        req.session.errors = errors || saveError
        req.session.unsavedValues = unsavedValues
        return res.redirect(303, req.originalUrl)
      }
      return res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || 'check-answers'}`)
    } catch (e) {
      logger.error(e)
      req.session.errors = !saveToApiSuccessful
        ? saveError
        : [
            {
              name: 'saveError',
              text: 'An error occurred saving',
            },
          ]
      res.redirect(303, req.originalUrl)
    }
  })
}
