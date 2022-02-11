import { Request, Response } from 'express'
import { addRescindRequestRecord } from '../../../clients/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { allowedEmailFileExtensions } from '../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload } from '../helpers/errorMessages'
import { makeUrlToFromPage } from '../helpers/makeUrl'
import { validateRescindRequest } from './validations/validateRescindRequest'

export const addRescindRequestFormHandler = async (req: Request, res: Response): Promise<void> => {
  const emailFieldName = 'rescindRequestEmailFileName'
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
      const { errors, valuesToSave, unsavedValues } = validateRescindRequest({
        requestBody: req.body,
        emailFileSelected,
        uploadFailed,
        invalidFileFormat,
      })
      const shouldSaveToApi = !errors && emailFileSelected && !uploadFailed
      if (shouldSaveToApi) {
        try {
          const response = await addRescindRequestRecord(
            recallId,
            {
              details: valuesToSave.details,
              emailFileName: file.originalname,
              emailFileContent: file.buffer.toString('base64'),
              emailReceivedDate: valuesToSave.emailReceivedDate,
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
      req.session.confirmationMessage = {
        text: 'Rescind request added.',
        link: {
          text: 'View',
          href: '#rescinds',
        },
        type: 'success',
      }
      res.redirect(303, makeUrlToFromPage(urlInfo.fromPage, urlInfo))
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
