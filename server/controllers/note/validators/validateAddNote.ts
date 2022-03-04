import { NoteDocumentUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../@types'
import { errorMsgNoteFileUpload, errorMsgProvideDetail, makeErrorObject } from '../../utils/errorMessages'

export const validateAddNote = ({
  requestBody,
  fileName,
  fileSelected,
  uploadFailed,
  invalidFileFormat,
}: NoteDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: { subject: string; details: string }
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let unsavedValues
  let valuesToSave
  const { subject, details } = requestBody
  const fileError = fileSelected && (uploadFailed || invalidFileFormat)
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
          text: errorMsgNoteFileUpload.uploadFailed(fileName),
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'fileName',
          text: errorMsgNoteFileUpload.invalidFileFormat(fileName),
        })
      )
    }
    unsavedValues = {
      subject,
      details,
    }
  }
  if (!errors) {
    valuesToSave = { subject, details }
  }
  return { errors, valuesToSave, unsavedValues }
}
