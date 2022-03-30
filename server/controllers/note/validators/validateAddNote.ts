import { FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import {
  errorMsgDocumentUpload,
  errorMsgNoteFileUpload,
  errorMsgProvideDetail,
  makeErrorObject,
} from '../../utils/errorMessages'
import { CreateNoteRequest } from '../../../@types/manage-recalls-api/models/CreateNoteRequest'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { isInvalidFileType } from '../../documents/upload/helpers/allowedUploadExtensions'

export const validateAddNote = ({
  requestBody,
  file,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<CreateNoteRequest> => {
  let errors
  let valuesToSave
  let confirmationMessage
  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.NOTE_DOCUMENT })
    : false

  const { subject, details } = requestBody
  const fileError = wasUploadFileReceived && (uploadFailed || invalidFileType)
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
    if (!uploadFailed && invalidFileType) {
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
