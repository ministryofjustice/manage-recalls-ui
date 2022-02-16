import { Request, Response } from 'express'
import { addRescindRecord, updateRescindRecord } from '../../../clients/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { allowedEmailFileExtensions } from '../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload } from '../helpers/errorMessages'
import { makeUrlToFromPage } from '../helpers/makeUrl'
import { validateRescindRequest } from './validations/validateRescindRequest'
import { RescindDecisionValuesToSave, validateRescindDecision } from './validations/validateRescindDecision'
import { RescindRequestRequest } from '../../../@types/manage-recalls-api/models/RescindRequestRequest'
import { RescindDecisionRequest } from '../../../@types/manage-recalls-api/models/RescindDecisionRequest'

export const rescindFormHandler =
  ({ action }: { action: 'add' | 'update' }) =>
  async (req: Request, res: Response): Promise<void> => {
    const emailFieldName = action === 'add' ? 'rescindRequestEmailFileName' : 'rescindDecisionEmailFileName'
    const validator = action === 'add' ? validateRescindRequest : validateRescindDecision
    let confirmationMessage: string
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
        const { errors, valuesToSave, unsavedValues } = validator({
          requestBody: req.body,
          emailFileSelected,
          uploadFailed,
          invalidFileFormat,
        })
        const shouldSaveToApi = !errors && emailFileSelected && !uploadFailed
        if (shouldSaveToApi) {
          try {
            let response

            if (action === 'add') {
              response = await addRescindRecord(
                recallId,
                {
                  ...valuesToSave,
                  emailFileName: file.originalname,
                  emailFileContent: file.buffer.toString('base64'),
                } as RescindRequestRequest,
                user.token
              )
              if (response.status === 201) {
                confirmationMessage = 'Rescind request added.'
                saveToApiSuccessful = true
              }
            } else {
              response = await updateRescindRecord(
                recallId,
                req.body.rescindRecordId,
                {
                  ...valuesToSave,
                  emailFileName: file.originalname,
                  emailFileContent: file.buffer.toString('base64'),
                } as RescindDecisionRequest,
                user.token
              )
              if (response.status === 200) {
                confirmationMessage = (valuesToSave as RescindDecisionValuesToSave).approved
                  ? 'Recall rescinded.'
                  : 'Rescind not approved.'
                saveToApiSuccessful = true
              }
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
          text: confirmationMessage,
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
