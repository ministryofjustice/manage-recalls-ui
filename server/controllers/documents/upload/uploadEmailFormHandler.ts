import { Request, Response } from 'express'
import { updateRecall, uploadRecallDocument } from '../../../clients/manageRecallsApiClient'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { NamedFormError, ReqEmailUploadValidatorFn, SaveToApiFn } from '../../../@types'
import { allowedEmailFileExtensions } from './helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, makeErrorObject, saveErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { processUpload } from './helpers/processUpload'

export const uploadEmailFormHandler =
  ({
    emailFieldName,
    validator,
    documentCategory,
    saveToApiFn,
  }: {
    emailFieldName: string
    validator: ReqEmailUploadValidatorFn
    documentCategory: UploadDocumentRequest.category
    saveToApiFn?: SaveToApiFn
  }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    const { request, uploadFailed } = await processUpload(emailFieldName, req, res)
    const { file } = request
    const emailFileSelected = Boolean(file)
    const invalidFileFormat = emailFileSelected
      ? !allowedEmailFileExtensions.some(ext => file.originalname.endsWith(ext.extension))
      : false
    const { errors, valuesToSave, unsavedValues, redirectToPage } = validator({
      requestBody: request.body,
      fileName: file?.originalname,
      emailFileSelected,
      uploadFailed,
      invalidFileFormat,
      actionedByUserId: user.uuid,
    })
    let errorList = errors
    const uploadHasErrors =
      errorList && errorList.find((uploadError: NamedFormError) => uploadError.name === emailFieldName)
    const shouldSaveEmailToApi = !uploadHasErrors && emailFileSelected && !uploadFailed

    // save email to api
    if (shouldSaveEmailToApi) {
      try {
        await uploadRecallDocument(
          recallId,
          {
            fileName: file.originalname,
            fileContent: file.buffer.toString('base64'),
            category: documentCategory,
          },
          user.token
        )
      } catch (e) {
        // add upload error to any existing validation errors
        errorList = [
          ...(errors || []),
          makeErrorObject({
            id: emailFieldName,
            text:
              e.data?.message === 'VirusFoundException'
                ? errorMsgEmailUpload.containsVirus(file.originalname)
                : errorMsgEmailUpload.uploadFailed,
          }),
        ]
      }
    }
    // either saving email to api failed, or other field(s) had validation errors
    if (errorList) {
      req.session.errors = errorList
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }
    // upload succeeded - are there form field values other than the uploaded email
    if (valuesToSave) {
      try {
        if (saveToApiFn) {
          await saveToApiFn({ recallId, valuesToSave, user })
        } else {
          await updateRecall(recallId, valuesToSave, user.token)
        }
      } catch (e) {
        req.session.unsavedValues = unsavedValues
        req.session.errors = [saveErrorObject]
        res.redirect(303, req.originalUrl)
      }
    }
    return res.redirect(
      303,
      urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl(redirectToPage, urlInfo)
    )
  }
