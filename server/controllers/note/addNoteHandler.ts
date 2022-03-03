import { Request, Response } from 'express'
import { addNote } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { allowedNoteFileExtensions } from '../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgDocumentUpload, makeErrorObject } from '../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../utils/makeUrl'
import { validateAddNote } from './validators/validateAddNote'

export const addNoteHandler = async (req: Request, res: Response): Promise<void> => {
  const documentFieldName = 'fileName'
  let confirmationMessage: string
  const processUpload = uploadStorageField(documentFieldName)
  const { recallId } = req.params
  const { user, urlInfo } = res.locals
  let saveError = [
    makeErrorObject({
      id: documentFieldName,
      text: errorMsgDocumentUpload.saveError,
    }),
  ]
  let saveToApiSuccessful = false
  processUpload(req, res, async err => {
    try {
      const uploadFailed = Boolean(err)
      const { file } = req
      const fileSelected = Boolean(file)
      const fileName = fileSelected ? file.originalname : undefined
      const invalidFileFormat = fileSelected
        ? !allowedNoteFileExtensions.some(ext => file.originalname.endsWith(ext.extension))
        : false
      const { errors, valuesToSave, unsavedValues } = validateAddNote({
        requestBody: req.body,
        fileSelected,
        fileName,
        uploadFailed,
        invalidFileFormat,
      })
      const shouldSaveToApi = !errors && !uploadFailed
      if (shouldSaveToApi) {
        try {
          const fileNameOrUndefined = fileSelected ? file.originalname : undefined
          const fileContentOrUndefined = fileSelected ? file.buffer.toString('base64') : undefined
          const request = {
            subject: valuesToSave.subject,
            details: valuesToSave.details,
            fileName: fileNameOrUndefined,
            fileContent: fileContentOrUndefined,
          }
          const response = await addNote(recallId, request, user.token)
          if (response.status === 201) {
            confirmationMessage = 'Note added.'
            saveToApiSuccessful = true
          }
        } catch (e) {
          saveToApiSuccessful = false
          if (e.data?.message === 'VirusFoundException') {
            saveError = [
              makeErrorObject({
                id: documentFieldName,
                text: errorMsgDocumentUpload.containsVirus(file.originalname),
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
          href: '#notes',
        },
        type: 'success',
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
