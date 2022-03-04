import { Request, Response } from 'express'
import { addNote, updateRecall, uploadRecallDocument } from '../../../clients/manageRecallsApiClient'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { NamedFormError, FormWithDocumentUploadValidatorFn, SaveToApiFn } from '../../../@types'
import { errorMsgDocumentUpload, makeErrorObject, saveErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { processUpload } from './helpers/processUpload'

export const formWithDocumentUploadHandler =
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
    const isNote = documentCategory === UploadDocumentRequest.category.NOTE_DOCUMENT
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
      if (isNote) {
        if (!errorList && !uploadHasErrors) {
          await addNote({ recallId, valuesToSave: { ...valuesToSave, ...fileData }, user })
        }
      } else if (wasUploadFileReceived && !uploadHasErrors && !uploadFailed) {
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
    if (valuesToSave && !isNote) {
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
    if (confirmationMessage) {
      req.session.confirmationMessage = confirmationMessage
    }
    return res.redirect(
      303,
      urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl(redirectToPage, urlInfo)
    )
  }
