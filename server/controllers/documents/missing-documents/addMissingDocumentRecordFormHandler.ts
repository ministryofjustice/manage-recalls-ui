import { Request, Response } from 'express'
import { addMissingDocumentRecord, getRecall } from '../../../clients/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from '../upload/helpers/uploadStorage'
import { validateMissingDocuments } from './validators/validateMissingDocuments'
import { errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { listMissingRequiredDocs } from '../upload/helpers'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'

export const addMissingDocumentRecordFormHandler = async (req: Request, res: Response): Promise<void> => {
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
      const { errors, valuesToSave, unsavedValues } = validateMissingDocuments({
        requestBody: req.body,
        wasUploadFileReceived: emailFileSelected,
        uploadFailed,
        fileName: file?.originalname,
      })
      const shouldSaveToApi = !errors && emailFileSelected && !uploadFailed
      if (shouldSaveToApi) {
        try {
          const recall = await getRecall(recallId, user.token)
          const missingDocumentCategories = listMissingRequiredDocs({
            docs: recall.documents,
            returnLabels: false,
          }) as RecallDocument.category[]
          const response = await addMissingDocumentRecord(
            {
              categories: missingDocumentCategories,
              recallId,
              details: valuesToSave.missingDocumentsDetail,
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
      return res.redirect(
        303,
        urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('check-answers', urlInfo)
      )
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
