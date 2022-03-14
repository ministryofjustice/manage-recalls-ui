import { Request, Response } from 'express'
import { updateRecall, uploadRecallDocument } from '../clients/manageRecallsApiClient'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { NamedFormError, FormWithDocumentUploadValidatorFn, SaveToApiFn } from '../@types'
import { errorMsgDocumentUpload, makeErrorObject, saveErrorWithDetails } from './utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from './utils/makeUrl'
import { processUpload } from './documents/upload/helpers/processUpload'

export const separateEmailAndFormSave =
  ({
    uploadFormFieldName,
    validator,
    documentCategory,
    saveToApiFn,
  }: {
    uploadFormFieldName: string
    validator: FormWithDocumentUploadValidatorFn
    documentCategory: UploadDocumentRequest.category
    saveToApiFn?: SaveToApiFn
  }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    const { request, uploadFailed } = await processUpload(uploadFormFieldName, req, res)
    const { file } = request
    const wasUploadFileReceived = Boolean(file)
    const { errors, valuesToSave, unsavedValues, redirectToPage, confirmationMessage } = validator({
      requestBody: request.body,
      fileName: file?.originalname,
      wasUploadFileReceived,
      uploadFailed,
      actionedByUserId: user.uuid,
    })
    let errorList = errors
    const uploadHasErrors =
      errorList && errorList.find((uploadError: NamedFormError) => uploadError.name === uploadFormFieldName)
    try {
      const fileData = file
        ? {
            fileName: file.originalname,
            fileContent: file.buffer.toString('base64'),
          }
        : {}
      if (wasUploadFileReceived && !uploadHasErrors && !uploadFailed) {
        await uploadRecallDocument(
          recallId,
          {
            ...fileData,
            category: documentCategory,
          } as UploadDocumentRequest,
          user.token
        )
      }
    } catch (e) {
      // add upload error to any existing validation errors
      errorList = [
        ...(errors || []),
        makeErrorObject({
          id: uploadFormFieldName,
          text:
            e.data?.message === 'VirusFoundException'
              ? errorMsgDocumentUpload.containsVirus(file.originalname)
              : errorMsgDocumentUpload.uploadFailed(file.originalname),
        }),
      ]
    }
    // either saving uploaded file to api failed, or other field(s) had validation errors
    if (errorList) {
      req.session.errors = errorList
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }
    // upload succeeded - are there form field values other than the uploaded file
    if (valuesToSave) {
      try {
        if (saveToApiFn) {
          await saveToApiFn({ recallId, valuesToSave, user })
        } else {
          await updateRecall(recallId, valuesToSave, user.token)
        }
      } catch (err) {
        req.session.unsavedValues = unsavedValues
        req.session.errors = [
          ...(errors || []),
          saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' }),
        ]
        return res.redirect(303, req.originalUrl)
      }
    }
    if (confirmationMessage) {
      req.session.confirmationMessage = confirmationMessage
    }
    return res.redirect(
      303,
      urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl(redirectToPage, urlInfo)
    )
  }
