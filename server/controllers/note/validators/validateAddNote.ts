import { FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import {
  errorMsgDocumentUpload,
  errorMsgNoteFileUpload,
  errorMsgProvideDetail,
  makeErrorObject,
} from '../../utils/errorMessages'
import { CreateNoteRequest } from '../../../@types/manage-recalls-api'
import { allowedNoteFileExtensions } from '../../documents/upload/helpers/allowedUploadExtensions'

export const validateAddNote = ({
  requestBody,
  fileName,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<CreateNoteRequest> => {
  let errors
  let valuesToSave
  let confirmationMessage
  const invalidFileName = wasUploadFileReceived
    ? !allowedNoteFileExtensions.some(ext => fileName.endsWith(ext.extension))
    : false
  const { subject, details } = requestBody
  const fileError = wasUploadFileReceived && (uploadFailed || invalidFileName)
  if (fileError || !subject || !details) {
    errors = []
    if (!subject) {
      errors.push(
        makeErrorObject({
          id: 'subject',
          text: 'Enter a subject',
        })
      )
    }
    if (!details) {
      errors.push(
        makeErrorObject({
          id: 'details',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'fileName',
          text: errorMsgDocumentUpload.uploadFailed(fileName),
        })
      )
    }
    if (!uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'fileName',
          text: errorMsgNoteFileUpload.invalidFileFormat(fileName),
        })
      )
    }
  }
  const unsavedValues = {
    subject,
    details,
  }
  if (!errors) {
    confirmationMessage = {
      text: 'Note added.',
      link: {
        text: 'View',
        href: '#notes',
      },
      type: 'success',
    }
    valuesToSave = { subject, details }
  }
  return { errors, valuesToSave, unsavedValues, confirmationMessage, redirectToPage: 'view-recall' }
}
